import os
import secrets

import gspread
import pyperclip
from dotenv import load_dotenv

load_dotenv()
API_KEYS_GOOGLE_SHEET_KEY = os.getenv("API_KEYS_GOOGLE_SHEET_KEY")

gc = gspread.service_account(
    filename="service_account.json",
    scopes=[
        "https://www.googleapis.com/auth/spreadsheets",
    ],
)

text_fr = """Hello {},  

Pour utiliser la plateforme, voici les étapes à suivre:  
1. Utilise Chrome 
2. Installe l'extension https://chromewebstore.google.com/detail/epfl-internships-but-bett/cgdpalglfipokmbjbofifdlhlkpcipnk 
3. Ping l'extension pour l'utiliser plus rapidement 
4. Va sur le site https://epfl-internships-but-better.vercel.app 
5. Entre ta clé sur le site: {}
6. Utilise l'extension pour exporter tes offres automatiquement 

Laisse-moi savoir si tu as des soucis et si tu trouves des points à améliorer!
"""

text_en = """Hello {},

To use the platform, please follow the steps below:

1. Use Chrome
2. Install the extension https://chromewebstore.google.com/detail/epfl-internships-but-bett/cgdpalglfipokmbjbofifdlhlkpcipnk
3. Ping the extension to use it quicker
4. Go on the website https://epfl-internships-but-better.vercel.app
5. Enter your key: {}
6. Use the extension to export your offers automatically

Let me know if you have any issues and suggestions!
"""

if __name__ == "__main__":
    first_name = input("First name: ")
    last_name = input("Last name: ")
    is_french = input("French? (y/n): ")
    api_key = secrets.token_urlsafe(32)

    sheet = gc.open_by_key(API_KEYS_GOOGLE_SHEET_KEY).sheet1

    sheet.append_row([first_name, last_name, api_key])

    text = text_en if is_french == "n" else text_fr

    pyperclip.copy(text.format(first_name, api_key))

    print(
        "API key {} generated successfully for {} {}!".format(
            api_key, first_name, last_name
        )
    )
