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
    input_variables=["locations"],
    partial_variables={
        "format_instructions": parser.get_format_instructions(),
        "query": location_query,
    },
)


def clean_locations(locations: list[str]):
    """
    Clean a list of locations using OpenAI.

    Args: locations (list[str]): A list of locations.

    Returns: A list of unique locations in a json format.
    """
    llm = OpenAI(
        model_name="gpt-3.5-turbo-instruct",
        openai_api_key=OPENAI_API_KEY,
        max_tokens=3000,
        request_timeout=60,
    )
    # print(llm)

    print("Number of locations:", len(locations))
    # Remove duplicates.
    locations = list(set(locations))
    print("Number of unique locations:", len(locations))

    # Split the locations into chunks of 50.
    chunks = [locations[x : x + 50] for x in range(0, len(locations), 50)]

    total_time = 0
    total_data: LocationDict = LocationDict(locations={})
    # By 50 locations, create a forloop
    for chunk in chunks:
        _input = prompt.format_prompt(locations=chunk)

        # print(output)
        data: LocationDict | None = None
        for _ in range(0, 3):
            # Time the request.
            start = time.time()
            print("Starting request...")
            output = llm.predict((_input.to_string()))
            end = time.time()
            print("Time taken:", round(end - start, 2))
            total_time += end - start
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

        total_data.locations.update(data.locations)

    print("Total time taken:", round(total_time, 2))

    # Send the unique locations formatted as a json.
    return orjson.loads(total_data.json())
