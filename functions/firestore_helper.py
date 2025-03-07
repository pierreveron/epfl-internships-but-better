# pyright: reportUnknownMemberType=false
import google.cloud.firestore  # type: ignore
from google.cloud.firestore import Increment  # type: ignore


def increment_formatting_count(db: google.cloud.firestore.Client, email: str):
    users_collection = db.collection("users")
    users_collection.document(email).set({"formattingCount": Increment(1)}, merge=True)


__all__ = [
    "increment_formatting_count",
]
