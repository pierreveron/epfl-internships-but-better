import {
  formatAtom,
  lengthAtom,
  locationsAtom,
  nbCitiesSelectedAtom,
  showOnlyFavoritesAtom,
  showOnlyPositionsNotYetCompletedAtom,
} from "@/atoms";
import CompanySelect from "@/components/CompanySelect";
import Footer from "@/components/Footer";
import FormatsSegmentedControl from "@/components/FormatsSegmentedControl";
import LengthsCheckboxes from "@/components/LengthsCheckboxes";
import LocationsCheckbox from "@/components/LocationsCheckbox";
import Table from "@/components/Table";
import WelcomingModal from "@/components/WelcomingModal";

import {
  RowData,
  SelectableCity,
  SelectableFormat,
  SelectableLength,
} from "@/types";
import {
  Alert,
  Button,
  Divider,
  Group,
  HoverCard,
  Modal,
  Popover,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useCounter, useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconChevronDown,
  IconInfoCircle,
} from "@tabler/icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

interface Props {
  data: RowData[];
  dataDate: string;
}

const NOT_SPECIFIED = "Not specified";

export default function Home() {
  const [data, setData] = useState<RowData[]>([]);
  const [dataDate, setDataDate] = useState<string>("");

  const updateData = () => {
    const data = localStorage.getItem("jobOffers");

    if (!data) {
      return;
    }

    const { offers, lastUpdated }: { offers: RowData[]; lastUpdated: string } =
      JSON.parse(data);

    setData(offers);
    setDataDate(new Date(lastUpdated).toLocaleDateString("fr-CH"));
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.addEventListener("jobOffersUpdated", () => {
        console.log("jobOffersUpdated");
        updateData();
      });

      updateData();
    }
  }, []);

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

    Object.keys(citiesByCountry).forEach((country) => {
      citiesByCountry[country] = citiesByCountry[country].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
    return citiesByCountry;
  }, [locations]);

  const setSelectableFormats = useSetAtom(formatAtom);
  const [selectableLengths, setSelectableLengths] = useAtom(lengthAtom);
  const [selectableLocations, setSelectableLocations] = useAtom(locationsAtom);
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom);
  const [
    showOnlyPositionsNotYetCompleted,
    setShowOnlyPositionsNotYetCompleted,
  ] = useAtom(showOnlyPositionsNotYetCompletedAtom);
  const [showOnlyFavorites, setShowOnlyFavorite] = useAtom(
    showOnlyFavoritesAtom
  );

  useEffect(() => {
    setSelectableFormats(
      Array.from(new Set(data.flatMap((d) => d.format))).map((format) => {
        return { name: format, selected: false };
      }) as SelectableFormat[]
    );
  }, [data, setSelectableFormats]);

  useEffect(() => {
    setSelectableLengths(
      Array.from(new Set(data.flatMap((d) => d.length))).map((length) => {
        return { name: length, selected: false };
      }) as SelectableLength[]
    );
  }, [data, setSelectableLengths]);

  const companies = useMemo(() => {
    return Array.from(new Set(data.flatMap((d) => d.company))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [data]);

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

      <WelcomingModal dataDate={dataDate} />

      <Stack style={{ height: "100vh" }} p="xl">
        <Group position="apart">
          <Group>
            <FormatsSegmentedControl />

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
                  Select lengths
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack spacing="xs">
                  <Button
                    variant="subtle"
                    disabled={
                      selectableLengths.filter((v) => v.selected).length === 0
                    }
                    onClick={() =>
                      setSelectableLengths((lengths) => {
                        return lengths.map((f) => ({ ...f, selected: false }));
                      })
                    }
                  >
                    Reset
                  </Button>
                  <LengthsCheckboxes />
                </Stack>
              </Popover.Dropdown>
            </Popover>

            <CompanySelect companies={companies} />
          </Group>

          <Group>
            <Switch
              styles={{
                label: { maxWidth: 200 },
                body: { alignItems: "center" },
              }}
              label="Show only offers with less candidates than places"
              checked={showOnlyPositionsNotYetCompleted}
              onChange={(event) =>
                setShowOnlyPositionsNotYetCompleted(event.currentTarget.checked)
              }
            />
            <Switch
              label="Show only favorites"
              checked={showOnlyFavorites}
              onChange={(event) =>
                setShowOnlyFavorite(event.currentTarget.checked)
              }
            />
          </Group>

          <Group spacing="xs">
            <Text c="dimmed">Last data update: {dataDate}</Text>
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
        <Footer />
      </Stack>
    </>
  );
}
