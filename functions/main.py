import asyncio
import hashlib
import hmac
import json
import os
import re
from typing import Any

from clean_bad_locations_openai import clean_locations as clean_locations_openai
from clean_salaries_openai import clean_salaries as clean_salaries_openai
from firebase_admin import initialize_app  # type: ignore
from firebase_functions import https_fn, options  # type: ignore

from functions.firestore import check_payment_status  # Add this import
from functions.webhook import fulfill_checkout  # type: ignore

app = initialize_app()


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
        cors_origins=["https://isa.epfl.ch"],
        cors_methods=["GET"],
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

    payment_status = check_payment_status(email)
    return https_fn.Response(
        json.dumps({"data": {"has_payment": payment_status}}),
        content_type="application/json",
    )
