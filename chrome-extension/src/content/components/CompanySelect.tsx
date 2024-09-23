import { Select } from '@mantine/core'
import { useContext } from 'react'
import { FilterContext } from '../contexts/FilterContext'

export default function CompanySelect({ companies }: { companies: string[] }) {
  const { selectedCompany, setSelectedCompany } = useContext(FilterContext)!

  return (
    <Select
      placeholder="Select a company"
      searchable
      clearable
      value={selectedCompany}
      onChange={(value) => setSelectedCompany(value)}
      nothingFoundMessage="No options"
      data={companies}
      maxDropdownHeight={300}
    />
  )
}
