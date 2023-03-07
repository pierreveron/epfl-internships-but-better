import json


def extract_bad_salaries(folder_name):
    with open(folder_name + 'scrapped-data.json', 'r') as json_file:
        data = json.load(json_file)

    bad_salaries = list_bad_locations(data)

    print("Number of salaries:", len(bad_salaries))

    with open(folder_name + 'bad-salaries.json', 'w') as json_file:
        json.dump(bad_salaries, json_file, indent=2, ensure_ascii=False)


def list_bad_locations(data):
    salaries = []
    for row in data:
        salary = data[row]['salary']
        if salary not in salaries:
            salaries.append(salary)
    return salaries


extract_bad_salaries('data/records/07-03-2023/')
