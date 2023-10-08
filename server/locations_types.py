from typing import List

from pydantic import BaseModel, Field


class Location(BaseModel):
    city: str = Field(description="city of a location")
    country: str = Field(description="country of a location")


class LocationDict(BaseModel):
    locations: dict[str, List[Location]] = Field(
        description="dictionary of lists of locations with the original text as key"
    )
