import asyncio
import json
import os
import re
import time
from typing import Any

import google.cloud.firestore  # type: ignore
from clean_bad_locations_openai import clean_locations as clean_locations_openai
from clean_salaries_openai import clean_salaries as clean_salaries_openai
from data_types.Offer import Location, Offer, OfferToFormat, Salary

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import firestore, initialize_app  # type: ignore

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import https_fn, options  # type: ignore
from firestore_helper import increment_formatting_count

app = initialize_app()


def get_db() -> google.cloud.firestore.Client:
    return firestore.client(app)  # type: ignore


WEBHOOK_SECRET = os.environ["LEMON_SQUEEZY_SIGNING_SECRET"]

ISA_ORIGIN = "https://isa.epfl.ch"
EXTENSION_ORIGIN = "chrome-extension://cgdpalglfipokmbjbofifdlhlkpcipnk"


def merge_formatted_data_into_offer(
    offer: OfferToFormat,
    salariesMap: dict[str, Salary],
    locationsMap: dict[str, list[Location]],
) -> Offer:
    default_location: list[Location] = [Location(city="Unknown", country=None)]
    non_formatted_salary: str = offer["salary"]
    non_formatted_location: str = offer["location"]

    salary = salariesMap.get(non_formatted_salary, non_formatted_salary)

    location = locationsMap.get(non_formatted_location, default_location)

    formatted_offer: Offer = offer.copy()  # type: ignore
    formatted_offer["salary"] = salary
    formatted_offer["location"] = location

    return formatted_offer


def chunk_list(lst: list[Any], n: int):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=[EXTENSION_ORIGIN],
        cors_methods=["POST"],
    ),
    timeout_sec=180,
)
# pyright: reportUnknownMemberType=false
def format_offers(req: https_fn.Request) -> https_fn.Response:
    start_time = time.time()

    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    try:
        json_data: dict[str, Any] = req.get_json()
        data = json_data.get("data", {})
        email: str = data.get("email", "")
        offers: list[OfferToFormat] = data.get("offers", [])

        if not email:
            return https_fn.Response(
                json.dumps({"error": "Email parameter is required"}), status=400
            )

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return https_fn.Response("Invalid email", status=400)

        # Stocker les offres à formater
        db = get_db()
        offers_to_format_collection = db.collection("offers_to_format")
        offers_collection = db.collection("offers")
        formatted_offers: list[Offer] = []
        offers_to_format: list[OfferToFormat] = []

        # Fetch all existing offers in multiple queries
        existing_offers = {}
        existing_formatted_offers = {}
        offer_numbers = [offer["number"] for offer in offers]

        for chunk in chunk_list(offer_numbers, 30):
            chunk_existing_offers = offers_to_format_collection.where(
                "number", "in", chunk
            ).stream()
            existing_offers.update(
                {doc.id: doc.to_dict() for doc in chunk_existing_offers}
            )

            chunk_existing_formatted_offers = offers_collection.where(
                "number", "in", chunk
            ).stream()
            existing_formatted_offers.update(
                {doc.id: doc.to_dict() for doc in chunk_existing_formatted_offers}
            )

        batch = db.batch()

        for offer in offers:
            offer_number = offer["number"]
            existing_offer = existing_offers.get(offer_number)

            if not existing_offer or existing_offer != offer:
                batch.set(
                    offers_to_format_collection.document(offer_number),
                    offer,  # type: ignore
                    merge=True,
                )
                offers_to_format.append(offer)
            else:
                formatted_offer = existing_formatted_offers.get(offer_number)
                if formatted_offer:
                    formatted_offers.append(formatted_offer)
                else:
                    print(
                        f"Error: Formatted offer not found for existing offer {offer_number}"
                    )

        print("Need to update", len(offers_to_format), "offers")

        # Commit the batch write
        batch.commit()

        async def clean_locations_and_salaries_in_parallel(
            locations: list[str], salaries: list[str]
        ) -> tuple[dict[str, list[Location]], dict[str, Salary]]:
            clean_locations_task = clean_locations_openai(locations)
            clean_salaries_task = clean_salaries_openai(salaries)
            clean_locations, clean_salaries = await asyncio.gather(
                clean_locations_task, clean_salaries_task
            )
            return clean_locations.model_dump()[
                "locations"
            ], clean_salaries.model_dump()["salaries"]

        locationsMap, salariesMap = asyncio.run(
            clean_locations_and_salaries_in_parallel(
                [o["location"] for o in offers_to_format],
                [o["salary"] for o in offers_to_format],
            )
        )

        # Create a new batch for formatted offers
        batch = db.batch()

        # Update formatted_offers with cleaned data
        for offer in offers_to_format:
            new_formatted_offer = merge_formatted_data_into_offer(
                offer, salariesMap, locationsMap
            )
            batch.set(
                offers_collection.document(offer["number"]),
                new_formatted_offer,  # type:ignore
                merge=True,
            )
            formatted_offers.append(new_formatted_offer)

        # Commit the batch write for formatted offers
        batch.commit()

        end_time = time.time()
        execution_time = end_time - start_time
        print(f"format_offers execution time: {execution_time:.2f} seconds")

        increment_formatting_count(db, email)

        return https_fn.Response(
            json.dumps({"data": formatted_offers}),
            content_type="application/json",
        )
    except Exception as e:
        end_time = time.time()
        execution_time = end_time - start_time
        print(
            f"format_offers execution time (with error): {execution_time:.2f} seconds"
        )
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=[EXTENSION_ORIGIN],
        cors_methods=["POST"],
    ),
)
def handle_sign_up(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    try:
        json_data: dict[str, Any] = req.get_json()
        data: dict[str, Any] = json_data.get("data", {})
        user_email: str | None = data.get("email")

        if not user_email:
            return https_fn.Response("Email is required", status=400)

        if not re.match(r"[^@]+@epfl\.ch$", user_email):
            return https_fn.Response(
                "Invalid email domain. Must be an EPFL email.", status=400
            )

        print("New user sign-up with email:", user_email)

        db = get_db()
        users_ref = db.collection("users")
        user_doc = users_ref.document(user_email)

        # Check if user already exists
        if user_doc.get().exists:
            return https_fn.Response("User already exists", status=400)

        # Create the user document
        user_doc.set({})

        return https_fn.Response(
            json.dumps(
                {
                    "data": {
                        "success": True,
                    }
                }
            ),
            content_type="application/json",
        )
    except Exception as e:
        print(f"Error handling sign-up: {str(e)}")
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=[EXTENSION_ORIGIN],
        cors_methods=["POST"],
    ),
)
def handle_sign_in(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    try:
        json_data: dict[str, Any] = req.get_json()
        data: dict[str, Any] = json_data.get("data", {})
        user_email: str | None = data.get("email")

        if not user_email:
            return https_fn.Response("Email is required", status=400)

        if not re.match(r"[^@]+@epfl\.ch$", user_email):
            return https_fn.Response(
                "Invalid email domain. Must be an EPFL email.", status=400
            )

        print("User sign-in with email:", user_email)

        db = get_db()
        user_doc = db.collection("users").document(user_email).get()

        if user_doc.exists:
            return https_fn.Response(
                json.dumps(
                    {
                        "data": {
                            "success": True,
                        }
                    }
                ),
                content_type="application/json",
            )
        else:
            return https_fn.Response(
                json.dumps(
                    {
                        "data": {
                            "success": False,
                            "error": "User not found",
                        }
                    }
                ),
                status=404,
                content_type="application/json",
            )

    except Exception as e:
        print(f"Error handling sign-in: {str(e)}")
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)
