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
import { IconChevronDown, IconInfoCircle } from "@tabler/icons";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

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

  const [hasModalBeenClosed, setHasModalBeenClosed] = useLocalStorage({
    key: "modal-closed",
    defaultValue: false,
  });

  const [isModalOpened, { close: closeModal, open: openModal }] =
    useDisclosure(false);

  useEffect(() => {
    if (!hasModalBeenClosed) {
      openModal();
    } else {
      closeModal();
    }
  }, [hasModalBeenClosed, closeModal, openModal]);

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
      {!hasModalBeenClosed && (
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
                <Text
                  span
                  style={{
                    background:
                      "linear-gradient(to right, #fa5252 0%, #fd7e14 10%, #fa5252 20%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "shine 2s infinite linear",
                    backgroundSize: "200% 100%",
                    whiteSpace: "nowrap",
                  }}
                >
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
                  user-friendly, especially when it comes to filtering
                  locations. For example, if you want to look for internships in{" "}
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
                  This concept notably aims to adress this particular issue. The
                  exact cities have been extracted from the original list of
                  locations using{" "}
                  <Text
                    span
                    fw={700}
                    c="red"
                    style={{
                      background:
                        "linear-gradient(to right, #fa5252 0%, #fd7e14 10%, #fa5252 20%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "shine 2s infinite linear",
                      backgroundSize: "200% 100%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    GPT-3
                  </Text>
                  .
                </Text>
              </>
            )}
            {modalPageCounter > 0 && (
              <Text>
                The table is populated with internships targeting Computer
                Science students.
              </Text>
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
      )}
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
