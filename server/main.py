from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Annotated

from clean_bad_locations_openai import clean_locations as clean_locations_openai

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/clean-locations")
async def clean_locations(locations: Annotated[List[str], Body()]):
    return clean_locations_openai(locations)
