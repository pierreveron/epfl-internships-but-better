import { ActionIcon, Checkbox, Collapse, Group, Text } from "@mantine/core";

import { useContext, useMemo, useState } from "react";

import { LocationsContext } from "@/contexts/LocationsContext";
import { useForceUpdate } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons";

export function IndeterminateCheckbox({ country }: { country: string }) {
  const { locations, setLocations } = useContext(LocationsContext)!;

  //   const cities = Array.from(new Set(locations.get(country)));

  const cities = useMemo(
    () => Array.from(new Set(locations.get(country))),
    [locations, country]
  );

  const allChecked = cities.every((value) => value.selected);
  const indeterminate = cities.some((value) => value.selected) && !allChecked;

  const [opened, setOpened] = useState(false);

  const forceUpdate = useForceUpdate();

  const items = cities.map((value, index) => (
    <Checkbox
      mt="xs"
      ml={33}
      label={value.name}
      key={value.name}
      //   key={randomId()}
      checked={value.selected}
      onChange={(event) => {
        setLocations((locations) => {
          const newCities = locations.get(country)?.map((l) => {
            if (l.name === value.name) {
              return { ...l, selected: event.currentTarget.checked };
            }
            return l;
          });
          locations.set(country, newCities!);
          return new Map(locations);
          //   return locations;
        });
        // forceUpdate();
      }}
    />
  ));

  const transitionDurationInMs = 300;

  return (
    <>
      <Group>
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          label={country}
          transitionDuration={0}
          onChange={() => {
            setLocations((locations) => {
              const newCities = locations.get(country)?.map((l) => {
                return { ...l, selected: !allChecked };
              });
              locations.set(country, newCities!);
              return new Map(locations);
            });
          }}
        />
        {cities.length > 0 && (
          <Group spacing="xs">
            <Text size="xs">
              {cities.filter((v) => v.selected).length}/{cities.length}
            </Text>
            <ActionIcon onClick={() => setOpened((opened) => !opened)}>
              <IconChevronDown
                style={{
                  transitionDuration: transitionDurationInMs + "ms",
                  transform: opened ? "rotate(0.5turn)" : undefined,
                }}
                size={18}
              />
            </ActionIcon>
          </Group>
        )}
      </Group>
      <Collapse in={opened} transitionDuration={transitionDurationInMs}>
        {items}
      </Collapse>
    </>
  );
}
