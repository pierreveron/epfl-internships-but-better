

import json

INTERNSHIPS_FILE_PATH = 'data2/stages.json'
LOCATIONS_MAP_FILE_PATH = 'data2/bad-to-good-locations.json'

# open both files
with open(INTERNSHIPS_FILE_PATH, 'r') as internships_file, open(LOCATIONS_MAP_FILE_PATH, 'r') as locations_map_file:

    # load the data from the files
    internships_data = json.load(internships_file)
    locations_map_data = json.load(locations_map_file)

    # for each internship, map the location to the good location
    for internship in internships_data:
        bad_location = internship['location']
        internship['location'] = locations_map_data[bad_location]

    # save the data to a new json file
    with open('data2/internships-with-good-locations.json', 'w') as json_file:
        json.dump(internships_data, json_file, indent=4, ensure_ascii=False)

    with open('epfl-interships/internships-with-good-locations.json', 'w') as json_file:
        json.dump(internships_data, json_file, indent=4, ensure_ascii=False)
