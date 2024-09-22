import { useAtom } from 'jotai'
import { sortStatusAtom } from '../atoms'
import { Select } from '@mantine/core'
import { IconArrowsSort } from '@tabler/icons-react'

const sortOptions = [
  { value: 'creationDate-desc', label: 'Creation date (newest first)' },
  { value: 'creationDate-asc', label: 'Creation date (oldest first)' },
  { value: 'company-asc', label: 'Company (A-Z)' },
  { value: 'company-desc', label: 'Company (Z-A)' },
  { value: 'salary-desc', label: 'Salary (high to low)' },
  { value: 'salary-asc', label: 'Salary (low to high)' },
  { value: 'registered-desc', label: 'Number of candidates (high to low)' },
  { value: 'registered-asc', label: 'Number of candidates (low to high)' },
]

export default function SortDropdown() {
  const [sortStatus, setSortStatus] = useAtom(sortStatusAtom)

  const handleChange = (value: string | null) => {
    if (value) {
      const [columnAccessor, direction] = value.split('-')
      setSortStatus({ columnAccessor, direction: direction as 'asc' | 'desc' })
    }
  }

  return (
    <Select
      value={sortStatus.columnAccessor ? `${sortStatus.columnAccessor}-${sortStatus.direction}` : null}
      onChange={handleChange}
      data={sortOptions}
      leftSection={<IconArrowsSort />}
    />
  )
}
