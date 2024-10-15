# pyright: reportUnknownMemberType=false

import hashlib

import google.cloud.firestore  # type: ignore
from data_types.UserData import UserData
from firebase_admin import firestore  # type: ignore
from google.cloud.firestore import Increment  # type: ignore


def increment_formatting_count(db: google.cloud.firestore.Client, email: str):
    users_collection = db.collection("users")
    users_collection.document(email).set({"formattingCount": Increment(1)}, merge=True)


def generate_referral_code(email: str) -> str:
    # Generate a unique affiliate code based on the user's email
    return hashlib.md5(email.encode()).hexdigest()[:8]


def get_referral_code(db: google.cloud.firestore.Client, email: str) -> str:
    users_collection = db.collection("users")
    doc_ref = users_collection.document(email)
    doc = doc_ref.get()

    if doc.exists:
        user_data = doc.to_dict()
        if user_data and "referralCode" in user_data:
            return user_data["referralCode"]

    # If no affiliate code exists, create a new one
    new_code = generate_referral_code(email)
    doc_ref.set({"referralCode": new_code}, merge=True)

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


def get_user_data(db: google.cloud.firestore.Client, email: str) -> UserData:
    try:
        users_collection = db.collection("users")
        user_doc = users_collection.document(email).get()

        user_data = user_doc.to_dict()

        if not user_data:
            raise ValueError(f"User data not found for {email}")

        referral_code: str = user_data.get("referralCode") or get_referral_code(
            db, email
        )

        return UserData(
            referredAt=referred_at,
            hasReferredSomeone=user_data.get("hasReferredSomeone", False),
            referralCode=referral_code,
        )
    except Exception as error:
        print(f"Error getting user data for {email}:", error)
        raise error


__all__ = [
    "get_referral_code",
    "get_user_data",
    "generate_referral_code",
]
