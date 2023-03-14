import { companyAtom } from "@/atoms";
import { Select } from "@mantine/core";
import { useAtom } from "jotai";

export default function CompanySelect({ companies }: { companies: string[] }) {
  const [selectedCompany, setSelectedCompany] = useAtom(companyAtom);

  return (
    <Select
      //   label="Company"
      placeholder="Select a company"
      searchable
      clearable
      value={selectedCompany}
      onChange={(value) => setSelectedCompany(value)}
      nothingFound="No options"
      data={companies}
      maxDropdownHeight={300}
    />
  );
}
