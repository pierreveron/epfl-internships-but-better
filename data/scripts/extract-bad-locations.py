# open the stages.html file
# read the file
# from the first table row, extract the table headers
# from the others table rows, extract the table data and the id of the row
# create a dictionary with the table headers as keys and the table data as values
# save the dictionary in a json file

import json

FILE_NAME = 'records/internships.json'

with open(FILE_NAME, 'r') as json_file:
    data = json.load(json_file)

    # select all the locations with no duplicates
    locations = []
    for row in data:
        if row['location'] not in locations:
            locations.append(row['location'])
    print("Number of locations:", len(locations))

    # save the locations in a json file
    with open('data2/bad-locations.json', 'w') as json_file:
        json.dump(locations, json_file, indent=4, ensure_ascii=False)
