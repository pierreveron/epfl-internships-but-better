import asyncio
import json
from typing import Any

from clean_bad_locations_openai import clean_locations as clean_locations_openai
from clean_salaries_openai import clean_salaries as clean_salaries_openai
from firebase_admin import initialize_app  # type: ignore
from firebase_functions import https_fn, options  # type: ignore

initialize_app()


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=["https://isa.epfl.ch"],
        cors_methods=["POST"],
    ),
)
def clean_locations(req: https_fn.Request) -> https_fn.Response:
    try:
        data: dict[str, Any] = req.get_json()
        locations: list[str] = data.get("data", [])

        if len(locations) > 500:
            return https_fn.Response(
                json.dumps({"error": "Too many locations"}), status=400
            )

        clean_locations = asyncio.run(clean_locations_openai(locations))

        print("clean_locations", clean_locations)
        return https_fn.Response(
            json.dumps({"data": clean_locations.model_dump()}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=["https://isa.epfl.ch"],
        cors_methods=["POST"],
    ),
)
def clean_salaries(req: https_fn.Request) -> https_fn.Response:
    try:
        data: dict[str, Any] = req.get_json()
        salaries: list[str] = data.get("data", [])

        if len(salaries) > 700:
            return https_fn.Response(
                json.dumps({"error": "Too many salaries"}), status=400
            )

        clean_salaries = asyncio.run(clean_salaries_openai(salaries))
        print("clean_salaries", clean_salaries)
        return https_fn.Response(
            json.dumps({"data": clean_salaries.model_dump()}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)
