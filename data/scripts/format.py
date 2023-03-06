# open stages-with-location-formatted.json which an array of objects
# and print all the  values for the key 'format'

import json

with open('data/stages-with-location-formatted.json', 'r') as json_file:
    data = json.load(json_file)
    format_labels = []
    for row in data:
        if row['format'] not in format_labels:
            format_labels.append(row['format'])

    print(format_labels)
