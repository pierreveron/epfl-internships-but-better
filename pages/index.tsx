import { formatAtom, locationsAtom } from "@/atoms";
import LocationsCheckbox from "@/components/LocationsCheckbox";
import { Format, RowData, SelectableCity, SelectableFormat } from "@/types";
import { Button, Flex, Popover, Stack, Switch } from "@mantine/core";
import { useAtom } from "jotai";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";

interface Props {
  data: RowData[];
}

const PAGE_SIZE = 15;

const NOT_SPECIFIED = "Not specified";

export default function Home({ data }: Props) {
  // sort data only once on initial render with useMemo
  const sortedData = useMemo(
    () =>
      data.sort((a, b) => {
        return a.company.localeCompare(b.company);
      }),
    [data]
  );

  const locations = useMemo(() => data.map((d) => d.location), [data]);

  const [selectableLocations, setSelectableLocations] = useAtom(locationsAtom);
  const [selectableFormats, setSelectableFormats] = useAtom(formatAtom);

  useEffect(() => {
    setSelectableFormats(
      Array.from(new Set(data.map((d) => d.format))).map((format) => {
        return { name: format, selected: false };
      }) as SelectableFormat[]
    );
  }, [data, setSelectableFormats]);

  // group cities by country
  const citiesByCountry = useMemo(() => {
    const citiesByCountry: Record<string, SelectableCity[]> = {};
    locations.flat().forEach((l) => {
      if (citiesByCountry.hasOwnProperty(l.country)) {
        // check if city is already in the list
        if (
          citiesByCountry[l.country]?.map((c) => c.name).includes(l.city) ||
          l.city === null
        ) {
          return;
        }
        citiesByCountry[l.country]?.push({ name: l.city, selected: false });
      } else {
        citiesByCountry[l.country ?? NOT_SPECIFIED] = [
          { name: l.city, selected: false },
        ];
      }
    });
    return citiesByCountry;
  }, [locations]);

  const [
    showOnlyPositionsNotYetCompleted,
    setShowOnlyPositionsNotYetCompleted,
  ] = useState(false);

  const nbCitiesSelected = useMemo(() => {
    return Object.keys(selectableLocations).reduce((acc, country) => {
      const cities = selectableLocations[country];
      const selectedCities = cities?.filter((city) => city.selected);
      return acc + (selectedCities?.length || 0);
    }, 0);
  }, [selectableLocations]);

  // filter sorted data on the registered column
  const filteredData = useMemo(() => {
    let data = sortedData;
    if (nbCitiesSelected !== 0) {
      data = data.filter((d) => {
        return (
          d.location.filter((l) => {
            return (
              selectableLocations[l.country ?? NOT_SPECIFIED]?.find(
                (c) => c.name === l.city
              )?.selected || false
            );
          }).length > 0
        );
      });
    }

    if (selectableFormats.some((f) => f.selected)) {
      data = data.filter((d) => {
        return (
          selectableFormats.find((f) => f.name === d.format)?.selected || false
        );
      });
    }

    if (showOnlyPositionsNotYetCompleted) {
      return data.filter((d) => d.registered < d.positions);
    }
    return data;
  }, [
    showOnlyPositionsNotYetCompleted,
    selectableLocations,
    sortedData,
    nbCitiesSelected,
    selectableFormats,
  ]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "company",
    direction: "asc",
  });
  const [records, setRecords] = useState(sortedData.slice(0, PAGE_SIZE));

  useEffect(() => {
    let d = filteredData;
    if (sortStatus.direction === "desc") {
      d = d.slice().reverse();
    }
    setRecords(d.slice(0, PAGE_SIZE));
    setPage(1);
  }, [sortStatus, filteredData]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    let d = filteredData;
    if (sortStatus.direction === "desc") {
      d = d.slice().reverse();
    }

    setRecords(d.slice(from, to));
  }, [page, filteredData]);

  useEffect(() => {
    setSelectableLocations(citiesByCountry);
  }, [citiesByCountry]);

  useEffect(() => {
    console.log("Number of cities selected:", nbCitiesSelected);
  }, [nbCitiesSelected]);

  return (
    <Stack style={{ height: "100vh" }}>
      <Flex direction="row">
        <Switch
          label="Show only positions not yet completed"
          checked={showOnlyPositionsNotYetCompleted}
          onChange={(event) =>
            setShowOnlyPositionsNotYetCompleted(event.currentTarget.checked)
          }
        />
        <Popover position="bottom-start" shadow="md">
          <Popover.Target>
            <Button>Select locations</Button>
          </Popover.Target>
          <Popover.Dropdown style={{ maxHeight: 300, overflowY: "scroll" }}>
            <Stack spacing="xs">
              <Button
                variant="subtle"
                disabled={nbCitiesSelected === 0}
                onClick={() =>
                  setSelectableLocations((locations) => {
                    Object.keys(locations).forEach((country) => {
                      locations[country].forEach((city) => {
                        city.selected = false;
                      });
                    });
                    return { ...locations };
                  })
                }
              >
                Reset
              </Button>
              {Object.keys(selectableLocations).map((country) => (
                <LocationsCheckbox key={country} country={country} />
              ))}
            </Stack>
          </Popover.Dropdown>
        </Popover>
        <Popover position="bottom-start" shadow="md">
          <Popover.Target>
            <Button>Select formats</Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Button
              variant="subtle"
              disabled={
                selectableFormats.filter((v) => v.selected).length === 0
              }
              onClick={() =>
                setSelectableFormats((locations) => {
                  return locations.map((l) => ({ ...l, selected: false }));
                })
              }
            >
              Reset
            </Button>
            <FormatsCheckboxes />
          </Popover.Dropdown>
        </Popover>
      </Flex>
      <DataTable
        withBorder
        highlightOnHover
        records={records}
        columns={[
          { accessor: "name", width: "20%" },
          { accessor: "company", sortable: true, width: "15%" },
          {
            accessor: "location",
            render: ({ location }) => (
              <ul style={{ listStyle: "none" }}>
                {location.map((loc) => (
                  <li key={`${loc.city}_${loc.country}`}>
                    {loc.city}, {loc.country ?? NOT_SPECIFIED}
                  </li>
                ))}
              </ul>
            ),
          },
          { accessor: "number" },
          { accessor: "format" },
          { accessor: "registered", textAlignment: "center" },
          { accessor: "positions", textAlignment: "center" },
          { accessor: "professor" },
          { accessor: "creationDate" },
        ]}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        totalRecords={filteredData.length}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
      />
    </Stack>
  );
}

// Fetching data from the JSON file
import { promises as fs } from "fs";
import path from "path";

import { GetStaticProps } from "next";
import FormatsCheckboxes from "@/components/FormatsCheckboxes";

export const getStaticProps: GetStaticProps<Props> = async () => {
  //Find the absolute path of the json directory
  const dataPath = path.join(process.cwd(), "/data.json");
  //Read the json data file data.json
  const fileContents = await fs.readFile(dataPath, "utf8");
  const data: RowData[] = JSON.parse(fileContents);

  return {
    props: { data },
  };
};
