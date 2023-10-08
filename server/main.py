from fastapi import FastAPI, Body
from typing import List, Annotated

from clean_bad_locations_openai import clean_locations as clean_locations_openai

app = FastAPI()


@app.post("/clean-locations")
async def clean_locations(locations: Annotated[List[str], Body()]):
    return clean_locations_openai(locations)
