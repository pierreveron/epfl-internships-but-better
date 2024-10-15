from typing import TypedDict


class UserData(TypedDict):
    hasReferredSomeone: bool
    referredAt: int | None
    referralCode: str
