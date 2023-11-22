import asyncio
import os
import time

import orjson
from dotenv import load_dotenv
from langchain.llms.openai import OpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from locations_types import LocationDict
from pydantic import ValidationError
from langchain.callbacks import get_openai_callback

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# location_query = "Extract the city and the country from a location in a json format."
location_query = """I have a list of text describing locations.
I want you to extract the city and the country from a location in a json format.
I don't want a zipcode. Only the city and the country.
The text should be the key and the value should be a list of locations. Cities and countries should only be strings. 
Countries should not be acronyms: for example "USA" should be change to "United States".
EPFL is refering to "Lausanne".
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


async def clean_locations(locations: list[str]):
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
    total_cost = 0
    total_tokens = 0

    async def async_predict(input_list: list[str]):
        nonlocal total_cost, total_tokens, total_time

        _input = prompt.format_prompt(locations=input_list)
        data: LocationDict | None = None

        for _ in range(0, 5):
            # Time the request.
            s = time.perf_counter()
            print("Starting request...")

            with get_openai_callback() as cb:
                output = await llm.apredict(_input.to_string())
                total_cost += cb.total_cost
                total_tokens += cb.total_tokens

            elapsed = time.perf_counter() - s
            print(f"Request took {elapsed:0.2f} seconds.")

            try:
                data = parser.parse(output)
            except ValidationError as e:
                print("A validation error occurred:", e)
                continue
            except Exception as e:
                print("An exception occurred:", e)
                continue
            break

        return data

    total_data: LocationDict = LocationDict(locations={})

    try:
        s = time.perf_counter()
        tasks = [async_predict(chunk) for chunk in chunks]
        data_list = await asyncio.gather(*tasks)
        elapsed = time.perf_counter() - s
        print(f"Total time taken {elapsed:0.2f} seconds.")
        print("List:", data_list)
        # Data can be None if there was an error.
        for data in data_list:
            if data is None:
                continue
            total_data.locations.update(data.locations)
    except Exception as e:
        print("Final exception")
        print("Total tokens used:", total_tokens)
        print(f"Total cost: $", round(total_cost, 2))
        print("An error occurred. Please try again.", e)
        raise e

    missing_keys = set(locations) - set(total_data.locations.keys())
    if len(missing_keys) > 0:
        print("Missing keys:", missing_keys)

    print("Total tokens used:", total_tokens)
    print(f"Total cost: $", round(total_cost, 2))
    print("Total time taken:", round(total_time, 2))

    # Send the unique locations formatted as a json.
    return orjson.loads(total_data.json())
