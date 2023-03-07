import json


def map_bad_locations_to_good_locations(folder_name):
    internships_file_name = folder_name + 'internships.json'
    locations_map_file_name = folder_name + 'bad-to-good-locations.json'

    with open(internships_file_name, 'r') as internships_file, open(locations_map_file_name, 'r') as locations_map_file:
        record = json.load(internships_file)
        locations_map_data = json.load(locations_map_file)

        data = record['data']

        # print(list_countries(locations_map_data))

        # for each internship, map the location to the good location
        for internship in data:
            bad_location = internship['location']
            internship['location'] = locations_map_data[bad_location]

    with open(folder_name + 'internships-with-good-locations.json', 'w') as json_file:
        json.dump(record, json_file,
                  indent=4, ensure_ascii=False)


def list_countries(locations_map_data):
    countries = {}
    for internship in locations_map_data:
        locations = locations_map_data[internship]
        for location in locations:
            if location['country'] not in countries:
                countries[location['country']] = []
            if location['city'] not in countries[location['country']]:
                countries[location['country']].append(location['city'])
    return countries


map_bad_locations_to_good_locations('data/records/07-03-2023/')
