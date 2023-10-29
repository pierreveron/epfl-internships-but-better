import {
  lengthAtom,
  locationsAtom,
  showOnlyFavoritesAtom,
  showOnlyPositionsNotYetCompletedAtom,
} from "@/atoms";
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
import CompanySelect from "./CompanySelect";
import FormatsSegmentedControl from "./FormatsSegmentedControl";
import LengthsCheckboxes from "./LengthsCheckboxes";
import LocationsCheckbox from "./LocationsCheckbox";

export default function ActionBar({
  nbCitiesSelected,
  companies,
  dataDate,
}: {
  nbCitiesSelected: number;
  companies: string[];
  dataDate: string;
}) {
  const [selectableLocations, setSelectableLocations] = useAtom(locationsAtom);
  const [selectableLengths, setSelectableLengths] = useAtom(lengthAtom);
  const [
    showOnlyPositionsNotYetCompleted,
    setShowOnlyPositionsNotYetCompleted,
  ] = useAtom(showOnlyPositionsNotYetCompletedAtom);
  const [showOnlyFavorites, setShowOnlyFavorite] = useAtom(
    showOnlyFavoritesAtom
  );

  return (
    <Group position="apart">
      <Group>
        <FormatsSegmentedControl />

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
          onChange={(event) => setShowOnlyFavorite(event.currentTarget.checked)}
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
  );
}
