import os
import time

import orjson
from dotenv import load_dotenv
from langchain.callbacks import get_openai_callback
from langchain.llms.openai import OpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from pydantic import ValidationError

from salaries_types import SalariesDict

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


salary_query = """I have a list of strings representing salaries.
I want to get the salary as a number.
Extract the monthly salary from the string.
Map the string to the number in a json object.
Use the exact strings in the list as the keys of the object.
If there's a distinction between a bachelor and a master salary, pick the master salary.
If more than one number given, always pick the lowest one.
Put null if no salary is found.
Put 0 if the salary is specified as "unpaid".
"""

parser = PydanticOutputParser(pydantic_object=SalariesDict)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\nFormat the following salaries:\n{salaries}\n",
    input_variables=["salaries"],
    partial_variables={
        "format_instructions": parser.get_format_instructions(),
        "query": salary_query,
    },
)


async def clean_salaries(salaries: list[str]):
    """
    Clean a list of salaries using OpenAI.

    Args: salaries (list[str]): A list of salaries.

    Returns: A list of unique salaries in a json format.
    """
    llm = OpenAI(
        model_name="gpt-3.5-turbo-instruct",
        openai_api_key=OPENAI_API_KEY,
        max_tokens=3000,
        request_timeout=60,
    )
    # print(llm)

    print("Number of salaries:", len(salaries))
    # Remove duplicates.
    salaries = list(set(salaries))
    print("Number of unique salaries:", len(salaries))

    # Split the salaries into chunks of 50.
    chunks = [salaries[x : x + 50] for x in range(0, len(salaries), 50)]

    total_time = 0
    total_cost = 0
    total_tokens = 0

    async def predict(input_list: list[str], retrying: bool = False) -> SalariesDict:
        nonlocal total_cost, total_tokens, total_time

        _input = prompt.format_prompt(salaries=input_list)
        data: SalariesDict | None = None

        for _try in range(0, 3):
            data = None

            # Time the request.
            start = time.time()
            print("Starting request...")

            with get_openai_callback() as cb:
                output = await llm.apredict((_input.to_string()))
                total_cost += cb.total_cost
                total_tokens += cb.total_tokens

            end = time.time()
            print("Time taken:", round(end - start, 2))
            total_time += end - start

            try:
                data = parser.parse(output)
                missing_keys = set(input_list) - set(data.salaries.keys())
                if len(missing_keys) > 0:
                    print("The keys in the input and output do not match.")
                    print("Missing keys:", missing_keys)
                    if retrying:
                        raise Exception("Retry {} failed.".format(_try))
                    else:
                        print("Retrying...")
                        data.salaries.update(
                            predict(list(missing_keys), retrying=True).salaries
                        )
            except ValidationError as e:
                data = None
                print("A validation error occurred:", e)
                continue
            except Exception as e:
                data = None
                print("An exception occurred:", e)
                continue
            break

        print("Data:", data)

        if data is None:
            raise Exception("No data was returned.")
        missing_keys = set(input_list) - set(data.salaries.keys())
        if len(missing_keys) > 0:
            print("Missing keys:", missing_keys)
            raise Exception("The keys in the input and final data do not match.")

        return data

    total_data: SalariesDict = SalariesDict(salaries={})

    try:
        # By 50 salaries, create a forloop
        for chunk in chunks:
            data = await predict(chunk)
            total_data.salaries.update(data.salaries)
    except Exception as e:
        print("Final exception")
        print("Total tokens used:", total_tokens)
        print(f"Total cost: $", round(total_cost, 2))
        print("An error occurred. Please try again.", e)
        raise e

    print("Total tokens used:", total_tokens)
    print(f"Total cost: $", round(total_cost, 2))
    print("Total time taken:", round(total_time, 2))

    # Send the unique salaries formatted as a json.
    return orjson.loads(total_data.json())
