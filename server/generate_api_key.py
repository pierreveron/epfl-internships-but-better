import os
import secrets

import gspread
from dotenv import load_dotenv

load_dotenv()
API_KEYS_GOOGLE_SHEET_KEY = os.getenv("API_KEYS_GOOGLE_SHEET_KEY")

gc = gspread.service_account(
    filename="service_account.json",
    scopes=[
        "https://www.googleapis.com/auth/spreadsheets",
    ],
)

if __name__ == "__main__":
    first_name = input("First name: ")
    last_name = input("Last name: ")
    api_key = secrets.token_urlsafe(32)

    sheet = gc.open_by_key(API_KEYS_GOOGLE_SHEET_KEY).sheet1

    sheet.append_row([first_name, last_name, api_key])

    print("API key generated successfully for {} {}!".format(first_name, last_name))
