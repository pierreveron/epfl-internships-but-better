import { Checkbox, Stack } from '@mantine/core'
import { useContext } from 'react'
import { FilterContext } from '../contexts/FilterContext'
import { formatLengthLabel } from '../utils/formatters'

export default function LengthsCheckboxes() {
  const { selectableLengths, setSelectableLengths } = useContext(FilterContext)!

  return (
    <Stack gap="xs">
      {selectableLengths
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((value) => (
          <Checkbox
            label={formatLengthLabel(value.name)}
            key={value.name}
            checked={value.selected}
            onChange={(event) => {
              setSelectableLengths((formats) => {
                return formats.map((l) => {
                  if (l.name === value.name) {
                    return { ...l, selected: event.currentTarget.checked }
                  }
                  return l
                })
              })
            }}
          />
        ))}
    </Stack>
  )
}
