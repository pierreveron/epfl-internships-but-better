import { Group, Select, SelectProps } from '@mantine/core'
import { IconArrowsSort, IconCheck, IconCrown } from '@tabler/icons-react'
import { useContext } from 'react'
import { SortContext } from '../contexts/SortContext'
import { useUser } from '../hooks/useUser'

const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
  <Group flex="1" gap="0.5rem" wrap="nowrap">
    {checked && <IconCheck size={16} />}
    <span className="tw-text-sm">{option.label}</span>
    {option.disabled && <IconCrown size={16} style={{ marginInlineStart: 'auto' }} />}
  </Group>
)

export default function SortDropdown() {
  const { sortStatus, setSortStatus } = useContext(SortContext)!
  const { user } = useUser()

  const sortOptions = [
    { value: 'creationDate-desc', label: 'Creation date (newest first)' },
    { value: 'creationDate-asc', label: 'Creation date (oldest first)' },
    { value: 'company-asc', label: 'Company (A-Z)' },
    { value: 'company-desc', label: 'Company (Z-A)' },
    { value: 'salary-desc', label: 'Salary (high to low)', disabled: !user?.isPremium },
    { value: 'salary-asc', label: 'Salary (low to high)', disabled: !user?.isPremium },
    { value: 'registered-desc', label: 'Number of candidates (high to low)' },
    { value: 'registered-asc', label: 'Number of candidates (low to high)' },
  ]

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
      renderOption={renderSelectOption}
    />
  )
}
