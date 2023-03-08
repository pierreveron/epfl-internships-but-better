import { Checkbox, Stack } from "@mantine/core";

import { lengthAtom } from "@/atoms";
import { useAtom } from "jotai";

export default function LengthsCheckboxes() {
  const [lengths, setLengths] = useAtom(lengthAtom);

  return (
    <Stack spacing="xs">
      {lengths.map((value) => (
        <Checkbox
          label={value.name}
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
