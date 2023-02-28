import { formatAtom, locationsAtom } from "@/atoms";
import FormatsCheckboxes from "@/components/FormatsCheckboxes";
import LocationsCheckbox from "@/components/LocationsCheckbox";
import { RowData, SelectableCity, SelectableFormat } from "@/types";
import {
  Button,
  Group,
  HoverCard,
  Popover,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconChevronDown, IconInfoCircle } from "@tabler/icons";
import { useAtom } from "jotai";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";

interface Props {
  data: RowData[];
  dataDate: string;
}

const PAGE_SIZE = 15;

const NOT_SPECIFIED = "Not specified";

const sortBy = (
  data: RowData[],
  columnAccessor: string,
  sortingDirection: "desc" | "asc"
) => {
  let dataSorted = data;
  if (columnAccessor === "company") {
    dataSorted = data.sort((a, b) => {
      return a.company.localeCompare(b.company);
    });
  } else if (columnAccessor === "creationDate") {
    dataSorted = data.sort((a, b) => {
      return (
        new Date(a.creationDate.split(".").reverse().join("-")).getTime() -
        new Date(b.creationDate.split(".").reverse().join("-")).getTime()
      );
    });
  }
  return sortingDirection === "desc" ? dataSorted.reverse() : dataSorted;
};

export default function Home({ data, dataDate }: Props) {
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

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "company",
    direction: "asc",
  });

  const sortedData = useMemo(() => {
    return sortBy(data, sortStatus.columnAccessor, sortStatus.direction);
  }, [sortStatus, data]);

  const [records, setRecords] = useState(sortedData.slice(0, PAGE_SIZE));

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

  useEffect(() => {
    let d = filteredData;
    setRecords(d.slice(0, PAGE_SIZE));
    setPage(1);
  }, [sortStatus, filteredData]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    let d = filteredData;
    setRecords(d.slice(from, to));
  }, [page, filteredData]);

  useEffect(() => {
    setSelectableLocations(citiesByCountry);
  }, [citiesByCountry, setSelectableLocations]);

  return (
    <Stack style={{ height: "100vh" }} p="xl">
      <Group>
        <Switch
          label="Show only positions not yet completed"
          checked={showOnlyPositionsNotYetCompleted}
          onChange={(event) =>
            setShowOnlyPositionsNotYetCompleted(event.currentTarget.checked)
          }
        />
        <Popover position="bottom-start" shadow="md">
          <Popover.Target>
            <Button rightIcon={<IconChevronDown size={18} />} variant="outline">
              Select locations
            </Button>
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
            <Button rightIcon={<IconChevronDown size={18} />} variant="outline">
              Select formats
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack spacing="xs">
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
            </Stack>
          </Popover.Dropdown>
        </Popover>
        <Group ml="auto" spacing="xs">
          <Text c="dimmed">Last update: {dataDate}</Text>
          <HoverCard width={280} shadow="md">
            <HoverCard.Target>
              <ThemeIcon
                variant="light"
                color="gray"
                style={{ cursor: "pointer" }}
              >
                <IconInfoCircle size={18} />
              </ThemeIcon>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Text size="sm">
                Data could not be up-to-date as it has to be changed manually.
              </Text>
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>
      </Group>
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
          { accessor: "creationDate", sortable: true, width: 150 },
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

import { promises as fs } from "fs";
import path from "path";

import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps<Props> = async () => {
  const fileName = "internships-with-good-locations.json";
  const dataPath = path.join(process.cwd(), "/" + fileName);

  // get the modification date of the file
  const stats = await fs.stat(dataPath);
  const modificationDate = stats.mtime;

  // format the date as DD.MM.YYYY
  const formattedDate = modificationDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const fileContents = await fs.readFile(dataPath, "utf8");
  const data: RowData[] = JSON.parse(fileContents);

  return {
    props: { data, dataDate: formattedDate },
  };
};
