import json
from bs4 import BeautifulSoup

FOLDER_NAME = "data_28-02-2023/"
FILE_NAME = 'records/' + FOLDER_NAME + '!PORTAL14S.portalCell'

with open(FILE_NAME, 'r') as html_file:
    content = html_file.read()
    soup = BeautifulSoup(content)
    table = soup.find('stages')
    table_rows = table.find_all('tr')

    headers = [
        "id",
        "name",
        "company",
        "location",
        "sustainabilityLabel",
        "number",
        "format",
        "registered",
        "positions",
        "professor",
        "creationDate"
    ]

    # the rest of the rows are the data
    data = []
    for tr in table_rows[1:]:
        tds = tr.find_all('td')
        row = [td.text for td in tds]
        row.insert(0, tr['id'])
        data.append(row)
    print("Number of offers available:", len(data))
    print(data[0])

    # trim the strings at the beginning and the end
    for row in data:
        for i in range(len(row)):
            row[i] = row[i].strip()

    # convert strings to ints only for the columns that contain numbers
    for row in data:
        for i in range(len(row)):
            try:
                row[i] = int(row[i])
            except ValueError:
                pass
    # print(data[0])

    # remove the empty strings
    for row in data:
        for i in range(len(row)):
            if row[i] == '':
                row[i] = None

    # in the format column, change "Stage ou PDM" to ["Stage", "PDM"], "Stage" to ["Stage"], "PDM coordonné" to ["PDM"]
    for row in data:
        if row[6] == 'Stage ou PDM':
            row[6] = ['internship', 'project']
        elif row[6] == 'Stage':
            row[6] = ['internship']
        elif row[6] == 'PDM coordonné':
            row[6] = ['project']

    for row in data:
        if row[9] == "à trouver (si PDM)":
            row[9] = None

    final_data = []
    for row in data:
        final_data.append(dict(zip(headers, row)))

    # remove the sustainabilityLabel from the dictionary
    for row in final_data:
        del row['sustainabilityLabel']

    with open('data2/stagestest.json', 'w') as json_file:
        json.dump(final_data, json_file, indent=4, ensure_ascii=False)
