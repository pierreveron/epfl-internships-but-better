import os
import time

import orjson
from dotenv import load_dotenv
from langchain.llms import OpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from locations_types import LocationDict
from pydantic import ValidationError

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# location_query = "Extract the city and the country from a location in a json format."
location_query = """I have a list of locations but it is really badly designed.
I want you to extract the city and the country from a location in a json format.
I don't want a zipcode. Only city and country. Cities and countries should only be strings.
Countries should not be acronyms: for example "USA" should be change to "United States".
EPFL should be changed to "Lausanne".
Infer the country if needed.
"""

parser = PydanticOutputParser(pydantic_object=LocationDict)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\nFormat the following locations:\n{locations}\n",
    input_variables=["query", "locations"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)


def clean_locations(locations: list[str]):
    llm = OpenAI(
        model_name="text-davinci-003",
        openai_api_key=OPENAI_API_KEY,
        max_tokens=3000,
        request_timeout=60,
    )
    print(llm)
    _input = prompt.format_prompt(query=location_query, locations=locations)
    # print(_input.to_string())

    # print(output)
    data: LocationDict | None = None
    for _ in range(0, 3):
        # Time the request.
        start = time.time()
        print("Starting request...")
        output = llm.predict((_input.to_string()))
        end = time.time()
        print("Time taken:", round(end - start, 2))
        try:
            data = parser.parse(output)
        except ValidationError as e:
            print("A validation error occurred.")
            print(e)
            continue
        except Exception as e:
            print("An exception occurred.")
            print(e)
            continue
        break

    if data is None:
        raise Exception("An error occurred. Please try again.")

    for value in data.locations.values():
        for location in value:
            if location.city == "Zürich":
                location.city = "Zurich"

    return orjson.loads(data.json())
