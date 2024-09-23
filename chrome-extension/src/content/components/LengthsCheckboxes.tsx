import { Checkbox, Stack } from '@mantine/core'
import { useContext } from 'react'
import { FilterContext } from '../contexts/FilterContext'

export function formatLengthLabel(label: string) {
  switch (label) {
    case '4 - 6 mois':
      return '4 - 6 months'
    case '2 - 3 mois':
      return '2 - 3 months'
    case 'Indifférent':
      return 'No preference'
    default:
      return label
  }
}

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
