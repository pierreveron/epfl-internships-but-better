from typing import Literal, Optional, TypedDict

from .PageData import PageData

Format = Literal["internship", "project"]


class Location(TypedDict):
    city: str
    country: Optional[str]


type Salary = str


# class Salary(TypedDict):
#     value: str
#     currency: str
#     period: str


class Offer(PageData):
    id: str
    title: str
    company: str
    location: list[Location]
    salary: Salary
    number: str
    format: list[Format]
    registered: int
    positions: int
    professor: Optional[str]
    creationDate: str


class OfferToFormat(Offer):
    location: str  # type: ignore
    salary: str
