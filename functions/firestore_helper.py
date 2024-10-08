# pyright: reportUnknownMemberType=false

import hashlib

import google.cloud.firestore  # type: ignore
from firebase_admin import firestore  # type: ignore
from google.cloud.firestore import Increment  # type: ignore


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


def generate_affiliate_code(email: str) -> str:
    # Generate a unique affiliate code based on the user's email
    return hashlib.md5(email.encode()).hexdigest()[:8]


def get_affiliate_code(db: google.cloud.firestore.Client, email: str) -> str:
    users_collection = db.collection("users")
    doc_ref = users_collection.document(email)
    doc = doc_ref.get()

    if doc.exists:
        user_data = doc.to_dict()
        if user_data and "affiliateCode" in user_data:
            return user_data["affiliateCode"]

    # If no affiliate code exists, create a new one
    new_code = generate_affiliate_code(email)
    doc_ref.set({"affiliateCode": new_code}, merge=True)

    # Create a referral code document
    db.collection("referralCodes").document(new_code).set(
        {
            "email": email,
            "createdAt": firestore.SERVER_TIMESTAMP,  # type: ignore
        }
    )

    return new_code


def check_referral_status(db: google.cloud.firestore.Client, email: str) -> bool:
    try:
        referral_codes_collection = db.collection("referralCodes")
        query = referral_codes_collection.where("email", "==", email).limit(1)
        docs = query.get()

        for doc in docs:
            referral_data = doc.to_dict()
            if referral_data:
                return referral_data.get("used", False)

        return False
    except Exception as error:
        print("Error checking referral status:", error)
        return False


__all__ = [
    "check_payment_status",
    "add_payment",
    "get_affiliate_code",
    "check_referral_status",
]
