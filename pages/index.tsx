import {
  formatAtom,
  locationsAtom,
  nbCitiesSelectedAtom,
  showOnlyPositionsNotYetCompletedAtom,
} from "@/atoms";
import FormatsCheckboxes from "@/components/FormatsCheckboxes";
import LocationsCheckbox from "@/components/LocationsCheckbox";
import Table from "@/components/Table";
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
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

interface Props {
  data: RowData[];
  dataDate: string;
}

const NOT_SPECIFIED = "Not specified";

export default function Home({ data, dataDate }: Props) {
  const locations = useMemo(() => data.map((d) => d.location), [data]);

  const citiesByCountry = useMemo(() => {
    const citiesByCountry: Record<string, SelectableCity[]> = {};
    locations.flat().forEach((l) => {
      if (citiesByCountry.hasOwnProperty(l.country)) {
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

  const [selectableFormats, setSelectableFormats] = useAtom(formatAtom);
  const [selectableLocations, setSelectableLocations] = useAtom(locationsAtom);
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom);
  const [
    showOnlyPositionsNotYetCompleted,
    setShowOnlyPositionsNotYetCompleted,
  ] = useAtom(showOnlyPositionsNotYetCompletedAtom);

  useEffect(() => {
    setSelectableFormats(
      Array.from(new Set(data.map((d) => d.format))).map((format) => {
        return { name: format, selected: false };
      }) as SelectableFormat[]
    );
  }, [data, setSelectableFormats]);

  useEffect(() => {
    setSelectableLocations(citiesByCountry);
  }, [citiesByCountry, setSelectableLocations]);

  return (
    <>
      <Head>
        <title>EPFL Interships but better</title>
        <meta
          name="description"
          content="EPFL interships interface redesigned to be more user-friendly"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
              <Button
                rightIcon={<IconChevronDown size={18} />}
                variant="outline"
              >
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
              <Button
                rightIcon={<IconChevronDown size={18} />}
                variant="outline"
              >
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
        <Table data={data} />
      </Stack>
    </>
  );
}

import { promises as fs } from "fs";
import path from "path";

import { GetStaticProps } from "next";
import Head from "next/head";

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
