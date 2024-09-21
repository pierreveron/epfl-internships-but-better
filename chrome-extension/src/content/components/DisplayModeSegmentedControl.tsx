import { SegmentedControl } from '@mantine/core'
import { useAtom } from 'jotai'
import { IconList, IconTable } from '@tabler/icons-react'
import { displayModeAtom } from '../atoms'

export default function DisplayModeSegmentedControl() {
  const [displayMode, setDisplayMode] = useAtom(displayModeAtom)

  const data = [
    { label: 'List', value: 'list', icon: <IconList size={16} /> },
    { label: 'Table', value: 'table', icon: <IconTable size={16} /> },
  ]

  return (
    <SegmentedControl
      value={displayMode}
      onChange={(value: string) => setDisplayMode(value as 'list' | 'table')}
      data={data.map((item) => ({
        value: item.value,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {item.icon}
            {/* <span style={{ marginLeft: '5px' }}>{item.label}</span> */}
          </div>
        ),
      }))}
    />
  )
}
