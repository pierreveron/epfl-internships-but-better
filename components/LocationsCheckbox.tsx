import {
  ActionIcon,
  Checkbox,
  Collapse,
  Flex,
  Group,
  Stack,
  Text,
} from "@mantine/core";

import { useMemo, useState } from "react";

import { locationsAtom } from "@/atoms";
import { getFlagEmojiWithName } from "@/utils/countries";
import { IconChevronDown } from "@tabler/icons";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";

const TRANSITION_DURATION_IN_MS = 300;

export default function LocationCheckbox({ country }: { country: string }) {
  const citiesAtom = useMemo(
    () => focusAtom(locationsAtom, (optic) => optic.prop(country)),
    [country]
  );

  const [cities, setCities] = useAtom(citiesAtom);

  const allChecked = cities.every((value) => value.selected);
  const indeterminate = cities.some((value) => value.selected) && !allChecked;

  const [opened, setOpened] = useState(false);

  const items = cities.map((value) => (
    <Checkbox
      label={value.name}
      key={value.name}
      checked={value.selected}
      onChange={(event) => {
        setCities((cities) => {
          return cities.map((l) => {
            if (l.name === value.name) {
              return { ...l, selected: event.currentTarget.checked };
            }
            return l;
          });
        });
      }}
    />
  ));

  const countryEmoji = getFlagEmojiWithName(country);
  const countryLabel = countryEmoji ? countryEmoji + " " + country : country;

  return (
    <Flex direction="column">
      <Group>
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          label={countryLabel}
          transitionDuration={0}
          onChange={() => {
            setCities((cities) => {
              return cities.map((l) => {
                return { ...l, selected: !allChecked };
              });
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
                  transitionDuration: TRANSITION_DURATION_IN_MS + "ms",
                  transform: opened ? "rotate(0.5turn)" : undefined,
                }}
                size={18}
              />
            </ActionIcon>
          </Group>
        )}
      </Group>
      <Collapse in={opened} transitionDuration={TRANSITION_DURATION_IN_MS}>
        <Stack spacing="xs" ml="md" mt="xs">
          {items}
        </Stack>
      </Collapse>
    </Flex>
  );
}
