import asyncio
import json

from clean_bad_locations_openai import clean_locations as clean_locations_openai
from clean_salaries_openai import clean_salaries as clean_salaries_openai
from firebase_admin import initialize_app
from firebase_functions import https_fn

initialize_app()


@https_fn.on_request()
def clean_locations(req: https_fn.Request) -> https_fn.Response:
    try:
        request_json = req.get_json()
        locations: list[str] = request_json.get("locations", [])

        if len(locations) > 500:
            return https_fn.Response(
                json.dumps({"error": "Too many locations"}), status=400
            )

        clean_locations = asyncio.run(clean_locations_openai(locations))
        return https_fn.Response(
            json.dumps(clean_locations), content_type="application/json"
        )
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)


@https_fn.on_request()
def clean_salaries(req: https_fn.Request) -> https_fn.Response:
    try:
        request_json = req.get_json()
        salaries: list[str] = request_json.get("salaries", [])

        if len(salaries) > 700:
            return https_fn.Response(
                json.dumps({"error": "Too many salaries"}), status=400
            )

        clean_salaries = asyncio.run(clean_salaries_openai(salaries))
        return https_fn.Response(
            json.dumps(clean_salaries), content_type="application/json"
        )
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500)
