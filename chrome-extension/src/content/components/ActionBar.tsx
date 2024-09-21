import { lengthAtom, locationsAtom, minimumSalaryAtom, showOnlyFavoritesAtom } from '../atoms'
import { Button, Group, HoverCard, NumberInput, Popover, Stack, Switch, Text, ThemeIcon } from '@mantine/core'
import { IconChevronDown, IconInfoCircle } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import CompanySelect from './CompanySelect'
import FormatsSegmentedControl from './FormatsSegmentedControl'
import LengthsCheckboxes from './LengthsCheckboxes'
import LocationsCheckbox from './LocationsCheckbox'
import DisplayModeSegmentedControl from './DisplayModeSegmentedControl'

export default function ActionBar({
  nbCitiesSelected,
  companies,
  dataDate,
}: {
  nbCitiesSelected: number
  companies: string[]
  dataDate: string
}) {
  const [selectableLocations, setSelectableLocations] = useAtom(locationsAtom)
  const [selectableLengths, setSelectableLengths] = useAtom(lengthAtom)
  const [showOnlyFavorites, setShowOnlyFavorite] = useAtom(showOnlyFavoritesAtom)
  const [minimumSalary, setMinimumSalary] = useAtom(minimumSalaryAtom)

  return (
    <Group justify="space-between">
      <Group>
        <DisplayModeSegmentedControl />
        <FormatsSegmentedControl />

        <Popover position="bottom-start" shadow="md">
          <Popover.Target>
            <Button rightSection={<IconChevronDown size={18} />} variant="outline">
              Select locations
            </Button>
          </Popover.Target>
          <Popover.Dropdown style={{ maxHeight: 300, overflowY: 'scroll' }}>
            <Stack gap="xs">
              <Button
                variant="subtle"
                disabled={nbCitiesSelected === 0}
                onClick={() =>
                  setSelectableLocations((locations) => {
                    Object.keys(locations).forEach((country) => {
                      locations[country].forEach((city) => {
                        city.selected = false
                      })
                    })
                    return { ...locations }
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
            <Button rightSection={<IconChevronDown size={18} />} variant="outline">
              Select lengths
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="xs">
              <Button
                variant="subtle"
                disabled={selectableLengths.filter((v) => v.selected).length === 0}
                onClick={() =>
                  setSelectableLengths((lengths) => {
                    return lengths.map((f) => ({ ...f, selected: false }))
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

        <NumberInput
          placeholder="Minimum salary"
          value={minimumSalary}
          onChange={(value) => {
            if (typeof value === 'string') {
              value = parseInt(value)
              if (isNaN(value)) {
                setMinimumSalary(undefined)
                return
              }
            }
            setMinimumSalary(value)
          }}
          step={500}
          min={0}
        />
      </Group>

      <Group>
        {/* <Switch
          styles={{
            label: { maxWidth: 200 },
            body: { alignItems: "center" },
          }}
          label="Show only offers with less candidates than places"
          checked={showOnlyPositionsNotYetCompleted}
          onChange={(event) =>
            setShowOnlyPositionsNotYetCompleted(event.currentTarget.checked)
          }
        /> */}
        <Switch
          label="Show only favorites"
          checked={showOnlyFavorites}
          onChange={(event) => setShowOnlyFavorite(event.currentTarget.checked)}
        />
      </Group>

      <Group gap="xs">
        <Text c="dimmed">Last data update: {dataDate}</Text>
        <HoverCard width={280} shadow="md">
          <HoverCard.Target>
            <ThemeIcon variant="light" color="gray" style={{ cursor: 'pointer' }}>
              <IconInfoCircle size={18} />
            </ThemeIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">Data could not be up-to-date as it has to be changed manually.</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
    </Group>
  )
}
