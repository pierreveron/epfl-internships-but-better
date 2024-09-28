from typing import Any

from firebase_functions import https_fn  # type: ignore

from functions.firestore import add_payment  # type: ignore


def fulfill_checkout(order_payload: dict[str, Any]) -> https_fn.Response:
    print(f"Fulfilling order: {order_payload}")
    attributes = order_payload["attributes"]

    email = attributes.get("user_email")
    payment_status = attributes.get("status")

    if payment_status == "paid" and email:
        try:
            add_payment("lemon-squeezy", email, order_payload)
            return https_fn.Response("Payment fulfilled", status=200)
        except Exception as e:
            print(f"Error fulfilling payment: {e}")
            return https_fn.Response("Error fulfilling payment", status=500)

    return https_fn.Response("Payment not fulfilled", status=200)
