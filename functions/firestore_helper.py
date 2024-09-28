# pyright: reportUnknownMemberType=false

from typing import Any

from firebase_admin import (  # type: ignore
    firestore,
    initialize_app,  # type: ignore
)
from google.cloud.firestore_v1.document import DocumentReference

initialize_app()

db = firestore.client()

users_collection = db.collection("users")
payments_collection = db.collection("payments")


def check_payment_status(email: str) -> bool:
    try:
        query = payments_collection.where("userEmail", "==", email)
        query_snapshot = query.get()
        return len(query_snapshot) > 0
    except Exception as error:
        print("Error checking payment status:", error)
        return False


def add_payment(processor: str, user_email: str, data: dict[str, Any]):
    result = payments_collection.add(
        {
            "processor": processor,
            "userEmail": user_email,
            "data": data,
        }
    )

    doc_ref: DocumentReference = result[1]

    print("Payment added to Firestore", user_email, doc_ref.id)  # type: ignore


# Export functions
__all__ = ["check_payment_status", "add_payment"]
