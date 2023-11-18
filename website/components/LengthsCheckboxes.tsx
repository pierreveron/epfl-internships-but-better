import { Checkbox, Stack } from "@mantine/core";

import { lengthAtom } from "@/atoms";
import { useAtom } from "jotai";

export function formatLengthLabel(label: string) {
  switch (label) {
    case "4 - 6 mois":
      return "4 - 6 months";
    case "2 - 3 mois":
      return "2 - 3 months";
    case "Indifférent":
      return "No preference";
    default:
      return label;
  }
}

export default function LengthsCheckboxes() {
  const [lengths, setLengths] = useAtom(lengthAtom);

  return (
    <Stack gap="xs">
      {lengths
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((value) => (
          <Checkbox
            label={formatLengthLabel(value.name)}
            key={value.name}
            checked={value.selected}
            onChange={(event) => {
              setLengths((formats) => {
                return formats.map((l) => {
                  if (l.name === value.name) {
                    return { ...l, selected: event.currentTarget.checked };
                  }
                  return l;
                });
              });
            }}
          />
        ))}
    </Stack>
  );
}
