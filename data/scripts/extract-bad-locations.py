import json


def extract_bad_locations(folder_name):
    with open(folder_name + 'internships.json', 'r') as record:
        record = json.load(record)

        data = record["data"]

        bad_locations = list_bad_locations(data)

        print("Number of locations:", len(bad_locations))

    with open(folder_name + 'bad-locations.json', 'w') as json_file:
        json.dump(bad_locations, json_file, indent=4, ensure_ascii=False)


def list_bad_locations(data):
    locations = []
    for row in data:
        if row['location'] not in locations:
            locations.append(row['location'])
    return locations


extract_bad_locations('data/records/07-03-2023/')
