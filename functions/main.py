import asyncio
import hashlib
import hmac
import json
import os
import re
from typing import Any

import google.cloud.firestore  # type: ignore
from clean_bad_locations_openai import clean_locations as clean_locations_openai
from clean_salaries_openai import clean_salaries as clean_salaries_openai

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import firestore, initialize_app  # type: ignore

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import https_fn, options  # type: ignore
from firestore_helper import add_payment, check_payment_status, get_formatting_count

app = initialize_app()


def get_db() -> google.cloud.firestore.Client:
    return firestore.client(app)  # type: ignore


WEBHOOK_SECRET = os.environ["LEMON_SQUEEZY_SIGNING_SECRET"]


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=["https://isa.epfl.ch"],
        cors_methods=["POST"],
    ),
)
def clean_data(req: https_fn.Request) -> https_fn.Response:
    try:
        data: dict[str, Any] = req.get_json()
        locations: list[str] = data.get("locations", [])
        salaries: list[str] = data.get("salaries", [])

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
                "locations": clean_locations.model_dump(),
                "salaries": clean_salaries.model_dump(),
            }

        result = asyncio.run(process_data())

        print("clean_data result:", result)
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
        cors_origins=["chrome-extension://cgdpalglfipokmbjbofifdlhlkpcipnk"],
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

    payment_status = check_payment_status(get_db(), email)
    formatting_count = get_formatting_count(get_db(), email)
    return https_fn.Response(
        json.dumps(
            {
                "data": {
                    "has_payment": payment_status,
                    "formatting_count": formatting_count,
                }
            }
        ),
        content_type="application/json",
    )
