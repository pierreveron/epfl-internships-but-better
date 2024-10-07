# pyright: reportUnknownMemberType=false

import random
import string
import time
from typing import Any

import google.cloud.firestore  # type: ignore
from google.cloud.firestore import Increment  # type: ignore


def check_payment_status(db: google.cloud.firestore.Client, email: str) -> bool:
    # Add a 5 sec timeout to make sure payment status has been update after checkout and prevent race conditions
    time.sleep(5)
    try:
        users_collection = db.collection("users")
        doc_ref = users_collection.document(email)
        doc = doc_ref.get()
        if doc.exists:
            return doc.get("payment") is not None
        return False
    except Exception as error:
        print("Error checking payment status:", error)
        return False


def add_payment(
    db: google.cloud.firestore.Client,
    processor: str,
    user_email: str,
    data: dict[str, Any],
):
    users_collection = db.collection("users")
    result = users_collection.document(user_email).set(
        {
            "payment": {
                "processor": processor,
                "data": data,
            }
        },
        merge=True,
    )

    print("Payment added to Firestore", user_email, result)  # type: ignore


def increment_formatting_count(db: google.cloud.firestore.Client, email: str):
    users_collection = db.collection("users")
    users_collection.document(email).set({"formatting_count": Increment(1)}, merge=True)


def get_formatting_count(db: google.cloud.firestore.Client, email: str) -> int:
    try:
        users_collection = db.collection("users")
        doc_ref = users_collection.document(email)
        doc = doc_ref.get()
        if doc.exists:
            doc_dict = doc.to_dict()
            return doc_dict.get("formatting_count", 0) if doc_dict else 0
        return 0
    except Exception as error:
        print("Error getting formatting count:", error)
        return 0


def generate_affiliate_code(length: int = 8) -> str:
    """Generate a random affiliate code."""
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for _ in range(length))


def get_affiliate_code(db: google.cloud.firestore.Client, email: str) -> str:
    users_collection = db.collection("users")
    doc_ref = users_collection.document(email)
    doc = doc_ref.get()

    if doc.exists:
        user_data = doc.to_dict()
        if user_data and "affiliate_code" in user_data:
            return user_data["affiliate_code"]

    # If no affiliate code exists, create a new one
    new_code = generate_affiliate_code()
    doc_ref.set({"affiliate_code": new_code}, merge=True)
    return new_code


# Export functions
__all__ = ["check_payment_status", "add_payment", "get_affiliate_code"]
