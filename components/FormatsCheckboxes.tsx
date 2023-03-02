import { Checkbox, Stack } from "@mantine/core";

import { formatAtom } from "@/atoms";
import { formatToLabel } from "@/utils/format";
import { useAtom } from "jotai";

export default function FormatsCheckboxes() {
  const [formats, setFormats] = useAtom(formatAtom);

  return (
    <Stack spacing="xs">
      {formats.map((value) => (
        <Checkbox
          label={formatToLabel(value.name)}
          key={value.name}
          checked={value.selected}
          onChange={(event) => {
            setFormats((formats) => {
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
