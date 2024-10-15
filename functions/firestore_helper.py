# pyright: reportUnknownMemberType=false

import hashlib

import google.cloud.firestore  # type: ignore
from data_types.UserData import UserData


def generate_referral_code(email: str) -> str:
    # Generate a unique affiliate code based on the user's email
    return hashlib.md5(email.encode()).hexdigest()[:8]


def get_referral_code(db: google.cloud.firestore.Client, email: str) -> str:
    users_collection = db.collection("users")
    doc_ref = users_collection.document(email)
    doc = doc_ref.get()

    user_data = doc.to_dict()
    if user_data:
        if "referralCode" in user_data:
            return user_data["referralCode"]
        else:
            new_code = generate_referral_code(email)
            doc_ref.set({"referralCode": new_code}, merge=True)
            return new_code

    raise ValueError(f"User data not found for {email}")


def get_referrer_status(db: google.cloud.firestore.Client, email: str) -> bool:
    try:
        referral_codes_collection = db.collection("referralCodes")
        query = referral_codes_collection.where("referrer", "==", email).limit(1)
        docs = query.get()

        for doc in docs:
            referral_data = doc.to_dict()
            if referral_data:
                return True

        return False
    except Exception as error:
        print("Error checking referral status:", error)
        return False


def get_referral_date(db: google.cloud.firestore.Client, email: str) -> int | None:
    try:
        referral_codes_collection = db.collection("referralCodes")
        query = referral_codes_collection.where("referee", "==", email).limit(1)
        docs = query.get()

        for doc in docs:
            referral_data = doc.to_dict()
            if referral_data:
                return referral_data.get("createdAt", None)

        return None
    except Exception as error:
        print("Error checking referree status:", error)
        return None


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
            referredAt=get_referral_date(db, email),
            hasReferredSomeone=get_referrer_status(db, email),
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
