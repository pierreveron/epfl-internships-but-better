from typing import Annotated, List

from clean_bad_locations_openai import clean_locations as clean_locations_openai
from clean_salaries_openai import clean_salaries as clean_salairies_openai
from fastapi import Body, FastAPI, HTTPException, Request, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "https://epfl-internships-but-better.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_keys = ["my_api_key"]

api_key_header = APIKeyHeader(name="X-API-Key")


def get_api_key(api_key_header: str = Security(api_key_header)) -> str:
    if api_key_header in api_keys:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API Key",
    )


@app.post("/clean-locations")
@limiter.limit("3/day")
async def clean_locations(
    request: Request,
    locations: Annotated[List[str], Body()],
    api_key: str = Security(get_api_key),
):
    if len(locations) > 500:
        return {"error": "Too many locations"}
    return clean_locations_openai(locations)


@app.post("/clean-salaries")
@limiter.limit("3/day")
async def clean_salaries(
    request: Request,
    salaries: Annotated[List[str], Body()],
    api_key: str = Security(get_api_key),
):
    if len(salaries) > 700:
        return {"error": "Too many salaries"}
    return clean_salairies_openai(salaries)
