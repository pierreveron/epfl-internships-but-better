import json


def add_scrapped_data(folder_name):
    scrapped_data_file_name = folder_name + 'scrapped-data.json'
    internships_file_name = folder_name + 'internships.json'

    with open(scrapped_data_file_name, 'r') as scrapped_data:
        scrapped_data = json.load(scrapped_data)

    # print(list_length_labels(scrapped_data))
    # print(list_salary_labels(scrapped_data))
    # print(list_hiringTime_labels_without_split(scrapped_data))
    # print(list_hiringTime_labels(scrapped_data))

    with open(internships_file_name, 'r') as record:
        record = json.load(record)

        data = record["data"]

        for row in data:
            number = row['number']
            elem = scrapped_data[f'{number}']
            row['length'] = elem['length']
            row['hiringTime'] = split_hiringTime(elem['hiringTime'])
            # row['salary'] = elem['salary']

    with open(internships_file_name, 'w') as json_file:
        json.dump(record, json_file, indent=2, ensure_ascii=False)


def list_length_labels(scrapped_data):
    return list_labels(scrapped_data, 'length')


def list_hiringTime_labels_without_split(scrapped_data):
    return list_labels(scrapped_data, 'hiringTime')


def list_hiringTime_labels(scrapped_data):
    labels = []
    for label in list_hiringTime_labels_without_split(scrapped_data):
        hiringTimes = split_hiringTime(label)
        for hiringTime in hiringTimes:
            if hiringTime not in labels:
                labels.append(hiringTime)
    return labels


def split_hiringTime(hiringTime):
    hiringTimes = hiringTime.split(',')
    hiringTimes = [hiringTime.strip() for hiringTime in hiringTimes]
    return hiringTimes


def list_salary_labels(scrapped_data):
    return list_labels(scrapped_data, 'salary')


def list_labels(scrapped_data, property):
    labels = []
    for row in scrapped_data:
        obj = scrapped_data[row]
        if obj[property] not in labels:
            labels.append(obj[property])
    return labels


add_scrapped_data('data/records/07-03-2023/')
