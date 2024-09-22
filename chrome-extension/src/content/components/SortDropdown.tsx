import { useAtom } from 'jotai'
import { sortStatusAtom } from '../atoms'

const sortOptions = [
  { value: 'creationDate', label: 'Creation Date' },
  { value: 'company', label: 'Company' },
  { value: 'salary', label: 'Salary' },
]

export default function SortDropdown() {
  const [sortStatus, setSortStatus] = useAtom(sortStatusAtom)

  return (
    <select
      value={sortStatus.columnAccessor}
      onChange={(e) => setSortStatus({ columnAccessor: e.target.value, direction: 'asc' })}
      className="tw-p-2 tw-border tw-rounded"
    >
      <option value="">Sort by</option>
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
