import json
from bs4 import BeautifulSoup


def extract_data_from_html_file(folder_name):
    file_name = folder_name + '!PORTAL14S.portalCell'

    with open(file_name, 'r') as html_file:
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

        # remove the empty strings
        for row in data:
            for i in range(len(row)):
                if row[i] == '':
                    row[i] = None

        final_data = []
        for row in data:
            final_data.append(dict(zip(headers, row)))

        # remove the sustainabilityLabel from the dictionary
        for row in final_data:
            del row['sustainabilityLabel']

        # print(list_format_labels(final_data))

        for row in final_data:
            format = row['format']

            if format == 'Stage ou PDM' or format == 'master project or Internship':
                row['format'] = ['internship', 'project']
            elif format == 'Stage' or format == 'Internship':
                row['format'] = ['internship']
            elif format == 'PDM coordonné':
                row['format'] = ['project']

        for row in final_data:
            professor = row['professor']
            if professor == "à trouver (si PDM)" or professor == "To find (if master project)":
                row['professor'] = None

        dataDate = folder_name.split('/')[2].replace('-', '.')

        # create an object with finalData and dataDate
        final_obj = {
            "dataDate": dataDate,
            "data": final_data
        }

        with open(folder_name + 'internships.json', 'w') as json_file:
            json.dump(final_obj, json_file, indent=4, ensure_ascii=False)


def list_format_labels(data):
    format_labels = []
    for row in data:
        if row['format'] not in format_labels:
            format_labels.append(row['format'])
    return format_labels


extract_data_from_html_file("data/records/07-03-2023/")
