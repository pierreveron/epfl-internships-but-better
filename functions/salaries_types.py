from pydantic import BaseModel, Field


class SalariesDict(BaseModel):
    salaries: dict[str, float | None] = Field(
        description="dictionary of salaries with the original text as key"
    )
