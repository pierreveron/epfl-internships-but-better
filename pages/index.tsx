import { IndeterminateCheckbox } from "@/components/IndeterminateCheckbox";
import { LocationsContext } from "@/contexts/LocationsContext";
import { RowData, SelectableCity } from "@/types";
import { Button, Flex, Popover, Stack, Switch } from "@mantine/core";
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

  // const countries = useMemo(
  //   () =>
  //     locations
  //       .flat()
  //       .map((l) => l.country)
  //       .filter((c, i, a) => a.indexOf(c) === i),
  //   [locations]
  // );

  // const countries = Array.from(new Set(locations.flat().map((l) => l.country)));

  // group cities by country
  const citiesByCountry = useMemo(() => {
    const citiesByCountry = new Map<string, SelectableCity[]>();
    locations.flat().forEach((l) => {
      if (citiesByCountry.has(l.country)) {
        // check if city is already in the list
        if (
          citiesByCountry
            .get(l.country)
            ?.map((c) => c.name)
            .includes(l.city) ||
          l.city === null
        ) {
          return;
        }
        citiesByCountry.get(l.country)?.push({ name: l.city, selected: false });
      } else {
        // push an empty list if city is null
        if (l.city === null) {
          citiesByCountry.set(l.country, []);
          return;
        }
        citiesByCountry.set(l.country, [{ name: l.city, selected: false }]);
      }
    });
    return citiesByCountry;
  }, [locations]);

  const countries = useMemo(
    () => Array.from(citiesByCountry.keys()),
    [citiesByCountry]
  );

  const [
    showOnlyPositionsNotYetCompleted,
    setShowOnlyPositionsNotYetCompleted,
  ] = useState(false);

  // filter sorted data on the registered column
  const filteredData = useMemo(() => {
    if (showOnlyPositionsNotYetCompleted) {
      return sortedData.filter((d) => d.registered < d.positions);
    }
    return sortedData;
  }, [showOnlyPositionsNotYetCompleted, sortedData]);

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

  const [selectableLocations, setSelectableLocations] =
    useState<Map<string, SelectableCity[]>>(citiesByCountry);

  useEffect(() => {
    let nbCitiesSelected = Array.from(selectableLocations.keys()).reduce(
      (acc, c) => {
        const cities = selectableLocations.get(c);
        const selectedCities = cities?.filter((c) => c.selected);
        return acc + (selectedCities?.length || 0);
      },
      0
    );
    console.log("Number of cities selected:", nbCitiesSelected);
  }, [selectableLocations]);

  const [currentUser, setCurrentUser] = useState(new Map().set("name", "Test"));

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
        <TestContext.Provider
          value={{
            currentUser,
            setCurrentUser,
          }}
        >
          <LocationsContext.Provider
            value={{
              locations: selectableLocations,
              setLocations: setSelectableLocations,
            }}
          >
            <Popover position="bottom-start" shadow="md">
              <Popover.Target>
                <Button>Select locations</Button>
              </Popover.Target>
              <Popover.Dropdown style={{ maxHeight: 300, overflowY: "scroll" }}>
                <Button
                  variant="subtle"
                  onClick={() =>
                    setSelectableLocations(
                      (locations) =>
                        new Map(
                          Array.from(locations).map(([country, cities]) => [
                            country,
                            cities.map((city) => ({
                              ...city,
                              selected: false,
                            })),
                          ])
                        )
                    )
                  }
                >
                  Reset
                </Button>
                {countries.map((country) => (
                  <IndeterminateCheckbox key={country} country={country} />
                ))}
                {/* <IndeterminateCheckbox country={"France"} /> */}
              </Popover.Dropdown>
            </Popover>
          </LocationsContext.Provider>
        </TestContext.Provider>
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

import { TestContext } from "@/contexts/TestContext";
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
