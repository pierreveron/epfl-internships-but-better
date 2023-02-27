import locationsAtom from "@/atoms/locationsAtom";
import { IndeterminateCheckbox } from "@/components/IndeterminateCheckbox";
import { RowData, SelectableCity } from "@/types";
import { Button, Flex, Popover, Stack, Switch } from "@mantine/core";
import { useAtom } from "jotai";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";

interface Props {
  data: RowData[];
}

const PAGE_SIZE = 15;

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
        // push an empty list if city is null
        if (l.city === null) {
          citiesByCountry[l.country] = [];
          return;
        }
        citiesByCountry[l.country] = [{ name: l.city, selected: false }];
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
        let locationSelected =
          d.location.filter((l) => {
            if (l.city === null) {
              return true;
            }
            return (
              selectableLocations[l.country]?.find((c) => c.name === l.city)
                ?.selected ?? true
            );
          }).length > 0;
        return locationSelected;
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
            <Button
              variant="subtle"
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
              <IndeterminateCheckbox key={country} country={country} />
            ))}
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
                    {loc.city}, {loc.country}
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
