import json

FOLDER_NAME = "data_28-02-2023/"
FILE_NAME = 'records/' + FOLDER_NAME + 'internships-with-good-locations.json'

with open(FILE_NAME, 'r') as json_file:
    data = json.load(json_file)
    # group the cities by country
    countries = {}
    for row in data:
        location = row['location'][0]
        if location['country'] not in countries:
            countries[location['country']] = []
        if location['city'] not in countries[location['country']]:
            countries[location['country']].append(location['city'])
    print(countries)
