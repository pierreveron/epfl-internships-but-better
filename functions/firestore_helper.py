# pyright: reportUnknownMemberType=false

from typing import Any

import google.cloud.firestore  # type: ignore
from google.cloud.firestore_v1.document import DocumentReference


def check_payment_status(db: google.cloud.firestore.Client, email: str) -> bool:
    try:
        payments_collection = db.collection("payments")
        query = payments_collection.where("userEmail", "==", email)
        query_snapshot = query.get()
        return len(query_snapshot) > 0
    except Exception as error:
        print("Error checking payment status:", error)
        return False


def add_payment(
    db: google.cloud.firestore.Client,
    processor: str,
    user_email: str,
    data: dict[str, Any],
):
    payments_collection = db.collection("payments")
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
