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

  const [hasModalBeenClosed, setHasModalBeenClosed] = useLocalStorage({
    key: "modal-closed",
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  const [isModalOpened, { close: closeModal }] = useDisclosure(
    !hasModalBeenClosed
  );

  const [
    modalPageCounter,
    {
      increment: incrementModalPageCounter,
      decrement: decrementModalPageCounter,
    },
  ] = useCounter(0);

  useEffect(() => {
    if (modalPageCounter > 1) {
      closeModal();
      setHasModalBeenClosed(true);
    }
  }, [closeModal, setHasModalBeenClosed, modalPageCounter]);

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
      <Modal
        opened={isModalOpened}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        onClose={() => {}}
        title={
          <Title order={1}>
            Welcome to{" "}
            <Text c="red">
              EPFL internships{" "}
              <Text span className="shine">
                BUT better
              </Text>
            </Text>
          </Title>
        }
      >
        <Stack>
          <Divider />
          <Title order={4}>
            This website is a redesign concept of the Internships tab on{" "}
            <span style={{ whiteSpace: "nowrap" }}>IS-Academia</span>.
          </Title>
          {modalPageCounter == 0 && (
            <>
              <Text>
                The official interface tends to be not particularly
                user-friendly, especially when it comes to filtering locations.
                For example, if you want to look for internships in{" "}
                <Text span fw={700}>
                  Lausanne
                </Text>
                , you have to select{" "}
                <Text span fw={700}>
                  &quot;Lausanne&quot;
                </Text>{" "}
                but also{" "}
                <Text span fw={700}>
                  &quot;Lausanne/Geneva&quot;
                </Text>
                ,{" "}
                <Text span fw={700}>
                  &quot;Lausanne/Genève&quot;
                </Text>{" "}
                or{" "}
                <Text span fw={700}>
                  &quot;Lausanne/Zurich&quot;
                </Text>{" "}
                and so many more.
              </Text>

              <Text>
                This concept notably aims to address this particular issue. The
                exact cities have been extracted from the original list of
                locations using{" "}
                <Text span fw={700} c="red" className="shine">
                  GPT-3
                </Text>
                .
              </Text>
            </>
          )}
          {modalPageCounter > 0 && (
            <>
              <Text>
                The data used here are internships targeting{" "}
                <Text span fw={700}>
                  Computer Science
                </Text>{" "}
                students.
              </Text>
              <Text>
                If you are from this department, you can use this website to to
                browse available internships assuming the data is{" "}
                <Text span fw={700}>
                  up-to-date
                </Text>
                . Current data dates from the{" "}
                <Text span fw={700} className="shine">
                  {dataDate}
                </Text>
                .
              </Text>
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="This website don't fully replace IS-Academia"
                color="red"
              >
                Once you identify an internship of interest, please take note of
                its number and look for it on IS-Academia, where you can submit
                your application.
              </Alert>
            </>
          )}

          <Group>
            {modalPageCounter > 0 && (
              <Button onClick={decrementModalPageCounter}>Back</Button>
            )}
            <Button ml="auto" onClick={incrementModalPageCounter}>
              {modalPageCounter == 0 ? "Next" : "Done"}
            </Button>
          </Group>
        </Stack>
      </Modal>
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

import { promises as fs } from "fs";
import path from "path";

import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps<Props> = async () => {
  const fileName = "internships-with-good-locations.json";
  const dataPath = path.join(process.cwd(), "/" + fileName);

  const fileContents = await fs.readFile(dataPath, "utf8");
  const { dataDate, data } = JSON.parse(fileContents);

  return {
    props: { data, dataDate },
  };
};
