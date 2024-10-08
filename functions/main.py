import asyncio
import datetime
import hashlib
import hmac
import json
import os
import re
import time
from typing import Any

import google.cloud.firestore  # type: ignore
from clean_bad_locations_openai import clean_locations as clean_locations_openai
from clean_salaries_openai import clean_salaries as clean_salaries_openai
from data_types.Offer import Location, Offer, OfferToFormat, Salary
from data_types.UserData import UserData

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import firestore, initialize_app  # type: ignore

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import https_fn, options  # type: ignore
from firestore_helper import (
    add_payment,
    check_payment_status,
    check_referral_status,
    get_affiliate_code,
    get_formatting_count,
    increment_formatting_count,
)

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
    timeout_sec=120,
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
    timeout_sec=120,
)
def clean_data(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    try:
        json_data: dict[str, dict[str, Any]] = req.get_json()
        print("json_data:", json_data)
        data = json_data.get("data", {})
        email: str = data.get("email", "")
        locations: list[str] = data.get("locations", [])
        salaries: list[str] = data.get("salaries", [])

        if not email:
            return https_fn.Response(
                json.dumps({"error": "Email parameter is required"}), status=400
            )

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return https_fn.Response("Invalid email", status=400)

        payment_status = check_payment_status(get_db(), email)

        formatting_count = get_formatting_count(get_db(), email)

        if not payment_status and formatting_count >= 4:
            return https_fn.Response(
                json.dumps({"error": "Too many formatting requests"}), status=400
            )

        print("locations:", len(locations))
        print("salaries:", len(salaries))

        if len(locations) > 500:
            return https_fn.Response(
                json.dumps({"error": "Too many locations"}), status=400
            )
        if len(salaries) > 700:
            return https_fn.Response(
                json.dumps({"error": "Too many salaries"}), status=400
            )

        async def process_data():
            clean_locations_task = clean_locations_openai(locations)
            clean_salaries_task = clean_salaries_openai(salaries)
            clean_locations, clean_salaries = await asyncio.gather(
                clean_locations_task, clean_salaries_task
            )
            return {
                "locations": clean_locations.model_dump()["locations"],
                "salaries": clean_salaries.model_dump()["salaries"],
            }

        result = asyncio.run(process_data())

        print("clean_data result:", result)

        increment_formatting_count(get_db(), email)

        return https_fn.Response(
            json.dumps({"data": result}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)


@https_fn.on_request()
def webhook(request: https_fn.Request) -> https_fn.Response:
    def fulfill_checkout(order_payload: dict[str, Any]) -> https_fn.Response:
        print(f"Fulfilling order: {order_payload}")
        attributes = order_payload["attributes"]

        email = attributes.get("user_email")
        payment_status = attributes.get("status")

        if payment_status == "paid" and email:
            try:
                add_payment(get_db(), "lemon-squeezy", email, order_payload)
                return https_fn.Response("Payment fulfilled", status=200)
            except Exception as e:
                print(f"Error fulfilling payment: {e}")
                return https_fn.Response("Error fulfilling payment", status=500)

        return https_fn.Response("Payment not fulfilled", status=200)

    if request.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    print(f"Received POST request on /webhook: {request.data}, {request.headers}")
    body = request.data
    signature = request.headers.get("X-Signature")
    event_name = request.headers.get("X-Event-Name")

    if event_name != "order_created":
        return https_fn.Response("Invalid event name", status=400)

    if not signature:
        return https_fn.Response("No signature provided", status=400)

    computed_signature = hmac.new(
        WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()

    if computed_signature != signature:
        return https_fn.Response("Invalid signature", status=401)

    order = json.loads(body)
    print(f"Received webhook: {order}")

    return fulfill_checkout(order["data"])


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=[EXTENSION_ORIGIN],
        cors_methods=["POST"],
    ),
)
def get_user_data(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    data: dict[str, Any] = req.get_json()
    email: str = data.get("data", "")
    if not email:
        return https_fn.Response("Email parameter is required", status=400)

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return https_fn.Response("Invalid email", status=400)

    db = get_db()
    payment_status = check_payment_status(db, email)
    formatting_count = get_formatting_count(db, email)
    affiliate_code = get_affiliate_code(db, email)
    referral_status = check_referral_status(db, email)

    return https_fn.Response(
        json.dumps(
            {
                "data": {
                    "has_payment": payment_status,
                    "formatting_count": formatting_count,
                    "affiliate_code": affiliate_code,
                    "referral_completed": referral_status,
                }
            }
        ),
        content_type="application/json",
    )


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=[ISA_ORIGIN, EXTENSION_ORIGIN],
        cors_methods=["POST"],
    ),
)
def get_upgrade_url(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    # Generate or retrieve the upgrade URL
    upgrade_url = os.getenv("LEMON_SQUEEZY_STORE_URL")

    return https_fn.Response(
        json.dumps({"data": {"url": upgrade_url}}),
        content_type="application/json",
    )


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
        data: dict[str, Any] = req.get_json()
        user_email: str | None = data.get("email")
        referral_code: str | None = data.get("referralCode")

        if not user_email:
            return https_fn.Response("Email is required", status=400)

        if not re.match(r"[^@]+@epfl\.ch$", user_email):
            return https_fn.Response(
                "Invalid email domain. Must be an EPFL email.", status=400
            )

        db = get_db()
        users_ref = db.collection("users")
        user_doc = users_ref.document(user_email)

        # Check if user already exists
        if user_doc.get().exists:
            return https_fn.Response("User already exists", status=400)

        createdAt = firestore.SERVER_TIMESTAMP  # type: ignore

        user_data: UserData = {
            "createdAt": createdAt,
            "hasReferredSomeone": False,
            "formattingCount": 0,
            "referredBy": None,
            "premiumUntil": None,
            "affiliateCode": generate_affiliate_code(user_email),
        }

        # Handle referral code if provided
        if referral_code:
            referral_doc = db.collection("referralCodes").document(referral_code).get()
            referral_data = referral_doc.to_dict()
            if referral_data:
                referrer_email = referral_data.get("email")
                user_data["referredBy"] = referrer_email
                user_data["premiumUntil"] = createdAt + datetime.timedelta(days=3)

                # Update the referrer's document to mark that they've referred someone
                db.collection("users").document(referrer_email).set(
                    {"hasReferredSomeone": True}, merge=True
                )

                print(
                    f"Referral code {referral_code} from {referrer_email} applied for user {user_email}"
                )
            else:
                return https_fn.Response(
                    json.dumps(
                        {
                            "data": {
                                "success": False,
                                "error": "Invalid referral code",
                            }
                        }
                    ),
                    status=400,
                )

        # Create the user document
        user_doc.set(user_data)  # type: ignore

        # Create a referral code document
        db.collection("referralCodes").document(user_data["affiliateCode"]).set(
            {
                "email": user_email,
                "createdAt": createdAt,
            }
        )

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


def generate_affiliate_code(email: str) -> str:
    # Generate a unique affiliate code based on the user's email
    return hashlib.md5(email.encode()).hexdigest()[:8]


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
        data: dict[str, Any] = req.get_json()
        user_email: str | None = data.get("email")

        if not user_email:
            return https_fn.Response("Email is required", status=400)

        if not re.match(r"[^@]+@epfl\.ch$", user_email):
            return https_fn.Response(
                "Invalid email domain. Must be an EPFL email.", status=400
            )

        db = get_db()
        user_doc = db.collection("users").document(user_email).get()

        if user_doc.exists:
            return https_fn.Response(
                json.dumps(
                    {
                        "success": True,
                    }
                ),
                content_type="application/json",
            )
        else:
            return https_fn.Response(
                json.dumps({"success": False, "error": "User not found"}),
                status=404,
                content_type="application/json",
            )

    except Exception as e:
        print(f"Error handling sign-in: {str(e)}")
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)
