import { useContext } from 'react'
import { Button, Group, NumberInput, Popover, Stack, Switch } from '@mantine/core'
import { IconChevronDown, IconCrown, IconRefresh } from '@tabler/icons-react'
import CompanySelect from './CompanySelect'
import FormatsSegmentedControl from './FormatsSegmentedControl'
import LengthsCheckboxes from './LengthsCheckboxes'
import LocationsCheckbox from './LocationsCheckbox'
import DisplayModeSegmentedControl from './DisplayModeSegmentedControl'
import { FilterContext } from '../contexts/FilterContext'
import { useData } from '../hooks/useData'
import { useUser } from '../hooks/useUser'

export default function ActionBar() {
  const { companies, newOffersCount, refreshData } = useData()
  const { user } = useUser()

  const {
    selectableLocations,
    setSelectableLocations,
    selectableLengths,
    setSelectableLengths,
    showOnlyFavorites,
    setShowOnlyFavorites,
    minimumSalary,
    setMinimumSalary,
    nbCitiesSelected,
  } = useContext(FilterContext)!

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
                    const updatedLocations = { ...locations }
                    Object.keys(updatedLocations).forEach((country) => {
                      updatedLocations[country] = updatedLocations[country].map((city) => ({
                        ...city,
                        selected: false,
                      }))
                    })
                    return updatedLocations
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
                onClick={() => setSelectableLengths((lengths) => lengths.map((f) => ({ ...f, selected: false })))}
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
          disabled={!user?.isPremium}
          title={!user?.isPremium ? 'Premium feature: Upgrade to filter by salary' : undefined}
        />

        {!user?.isPremium && (
          <Button
            component="a"
            href={`https://epfl-internships-but-better.lemonsqueezy.com/buy/55677453-102d-4b40-9002-82c5d54176b8?checkout[email]=${user?.email}`}
            variant="gradient"
            gradient={{ from: 'gold', to: 'orange' }}
            leftSection={<IconCrown size={18} />}
          >
            Upgrade to Premium
          </Button>
        )}
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
          onChange={(event) => {
            setShowOnlyFavorites(event.currentTarget.checked)
          }}
        />
      </Group>

      {!user?.isPremium && (
        <Button
          variant="subtle"
          color="red"
          leftSection={<IconRefresh size={18} />}
          onClick={() => {
            refreshData()
          }}
          disabled={newOffersCount === 0 || (user?.formattingCount ?? 0) >= 3}
          rightSection={`(${user?.formattingCount ?? 0}/3)`}
        >
          {(user?.formattingCount ?? 0) >= 3
            ? 'No formatting credits left, please upgrade to premium'
            : newOffersCount === 0
            ? 'No new offers'
            : newOffersCount === 1
            ? '1 new offer'
            : `${newOffersCount} new offers`}
        </Button>
      )}

      {/* <Group gap="xs">
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
      </Group> */}
    </Group>
  )
}
