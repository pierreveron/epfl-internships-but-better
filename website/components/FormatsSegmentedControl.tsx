import { SegmentedControl } from "@mantine/core";

import { formatAtom } from "@/atoms";
import { formatToLabel } from "@/utils/format";
import { useAtom } from "jotai";

export default function FormatsSegmentedControl() {
  const [formats, setFormats] = useAtom(formatAtom);

  const data = [
    { label: "All", value: "all" },
    ...formats.map((f) => ({
      label: formatToLabel(f.name),
      value: f.name,
    })),
  ];

  return (
    <SegmentedControl
      value={
        formats.every((f) => !f.selected)
          ? "all"
          : formats.find((f) => f.selected)?.name
      }
      onChange={(format: string) => {
        if (format === "all") {
          setFormats((formats) =>
            formats.map((f) => ({ ...f, selected: false }))
          );
        } else {
          setFormats((formats) =>
            formats.map((f) => {
              if (format === f.name) {
                return { ...f, selected: true };
              }
              return { ...f, selected: false };
            })
          );
        }
      }}
      data={data}
    />
  );
}
