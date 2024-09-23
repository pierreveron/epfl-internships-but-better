import { SegmentedControl } from '@mantine/core'

import { formatToLabel } from '../utils/format'
import { useContext } from 'react'
import { FilterContext } from '../contexts/FilterContext'

export default function FormatsSegmentedControl() {
  const { selectableFormats, setSelectableFormats } = useContext(FilterContext)!

  const data = [
    { label: 'All', value: 'all' },
    ...selectableFormats.map((f) => ({
      label: formatToLabel(f.name),
      value: f.name,
    })),
  ]

  return (
    <SegmentedControl
      value={selectableFormats.every((f) => !f.selected) ? 'all' : selectableFormats.find((f) => f.selected)?.name}
      onChange={(format: string) => {
        if (format === 'all') {
          setSelectableFormats((formats) => formats.map((f) => ({ ...f, selected: false })))
        } else {
          setSelectableFormats((formats) =>
            formats.map((f) => {
              if (format === f.name) {
                return { ...f, selected: true }
              }
              return { ...f, selected: false }
            }),
          )
        }
      }}
      data={data}
    />
  )
}
