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
from firestore_helper import add_payment, check_payment_status

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
def clean_locations(req: https_fn.Request) -> https_fn.Response:
    try:
        data: dict[str, Any] = req.get_json()
        locations: list[str] = data.get("data", [])

        if len(locations) > 500:
            return https_fn.Response(
                json.dumps({"data": {"error": "Too many locations"}}), status=400
            )

        clean_locations = asyncio.run(clean_locations_openai(locations))

        print("clean_locations", clean_locations)
        return https_fn.Response(
            json.dumps({"data": clean_locations.model_dump()}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=["https://isa.epfl.ch"],
        cors_methods=["POST"],
    ),
)
def clean_salaries(req: https_fn.Request) -> https_fn.Response:
    try:
        data: dict[str, Any] = req.get_json()
        salaries: list[str] = data.get("data", [])

        if len(salaries) > 700:
            return https_fn.Response(
                json.dumps({"data": {"error": "Too many salaries"}}), status=400
            )

        clean_salaries = asyncio.run(clean_salaries_openai(salaries))
        print("clean_salaries", clean_salaries)
        return https_fn.Response(
            json.dumps({"data": clean_salaries.model_dump()}),
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
def get_payment_status(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    data: dict[str, Any] = req.get_json()
    email: str = data.get("data", "")
    if not email:
        return https_fn.Response("Email parameter is required", status=400)

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return https_fn.Response("Invalid email", status=400)

    payment_status = check_payment_status(get_db(), email)
    return https_fn.Response(
        json.dumps({"data": {"has_payment": payment_status}}),
        content_type="application/json",
    )
