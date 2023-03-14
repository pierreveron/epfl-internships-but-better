import { companyAtom } from "@/atoms";
import { Checkbox, Stack } from "@mantine/core";

import { useAtom } from "jotai";

export default function CompaniesCheckboxes() {
  const [companies, setCompanies] = useAtom(companyAtom);

  return (
    <Stack spacing="xs">
      {companies.map((value) => (
        <Checkbox
          label={value.name}
          key={value.name}
          checked={value.selected}
          onChange={(event) => {
            setCompanies((companies) => {
              return companies.map((l) => {
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
