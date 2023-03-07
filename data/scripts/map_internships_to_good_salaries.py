import json


def map_bad_locations_to_good_locations(folder_name):
    internships_file_name = folder_name + 'internships-with-good-locations.json'
    scrapped_data_file_name = folder_name + 'scrapped-data.json'
    salaries_map_file_name = folder_name + 'bad-to-good-salaries.json'

    with open(internships_file_name, 'r') as internships_file, open(scrapped_data_file_name, 'r') as scrapped_data, open(salaries_map_file_name, 'r') as salaries_map_file:
        record = json.load(internships_file)
        salaries_map_data = json.load(salaries_map_file)
        scrapped_data = json.load(scrapped_data)

        data = record['data']

        for internship in data:
            number = internship['number']
            elem = scrapped_data[f'{number}']
            bad_salary = elem['salary']
            if bad_salary is not None:
                internship['salary'] = salaries_map_data[f'{bad_salary}']
            else:
                internship['salary'] = None

    with open(folder_name + 'internships-with-good-locations-and-salaries.json', 'w') as json_file:
        json.dump(record, json_file,
                  indent=2, ensure_ascii=False)


map_bad_locations_to_good_locations('data/records/07-03-2023/')
