import { ActionIcon, Checkbox, Collapse, Flex, Group, Stack, Text } from '@mantine/core'

import { useContext, useState } from 'react'

import { getFlagEmojiWithName } from '../utils/countries'
import { IconChevronDown } from '@tabler/icons-react'
import { FilterContext } from '../contexts/FilterContext'
import { SelectableCity } from '../types'

const TRANSITION_DURATION_IN_MS = 300

export default function LocationCheckbox({ country }: { country: string }) {
  const { selectableLocations, setSelectableLocations } = useContext(FilterContext)!

  const cities = selectableLocations[country]

  const setCities = (updater: (cities: SelectableCity[]) => SelectableCity[]) => {
    setSelectableLocations((locations) => ({
      ...locations,
      [country]: updater(locations[country]),
    }))
  }

  const allChecked = cities.every((value) => value.selected)
  const indeterminate = cities.some((value) => value.selected) && !allChecked

  const [opened, setOpened] = useState(false)

  const items = cities.map((value) => (
    <Checkbox
      label={value.name}
      key={value.name}
      checked={value.selected}
      onChange={(event) => {
        setCities((cities) => {
          return cities.map((l) => {
            if (l.name === value.name) {
              return { ...l, selected: event.currentTarget.checked }
            }
            return l
          })
        })
      }}
    />
  ))

  const countryEmoji = getFlagEmojiWithName(country)
  const countryLabel = countryEmoji ? countryEmoji + ' ' + country : country

  return (
    <Flex direction="column">
      <Group>
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          label={countryLabel}
          onChange={() => {
            setCities((cities) => {
              return cities.map((l) => ({
                ...l,
                selected: !allChecked,
              }))
            })
          }}
        />
        {cities.length > 0 && (
          <Group gap="xs">
            <Text size="xs">
              {cities.filter((v) => v.selected).length}/{cities.length} cities
            </Text>
            <ActionIcon onClick={() => setOpened((opened) => !opened)} variant="subtle" color="gray">
              <IconChevronDown
                style={{
                  // color: "red",
                  transitionDuration: TRANSITION_DURATION_IN_MS + 'ms',
                  transform: opened ? 'rotate(0.5turn)' : undefined,
                }}
                size={18}
              />
            </ActionIcon>
          </Group>
        )}
      </Group>
      <Collapse in={opened} transitionDuration={TRANSITION_DURATION_IN_MS}>
        <Stack gap="xs" ml="md" mt="xs">
          {items}
        </Stack>
      </Collapse>
    </Flex>
  )
}
