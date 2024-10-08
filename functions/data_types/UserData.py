from typing import Any, TypedDict


class UserData(TypedDict):
    createdAt: Any  # Using Any for SERVER_TIMESTAMP
    hasReferredSomeone: bool
    formattingCount: int
    referredBy: str | None
    premiumUntil: Any | None  # Using Any for datetime
    affiliateCode: str
