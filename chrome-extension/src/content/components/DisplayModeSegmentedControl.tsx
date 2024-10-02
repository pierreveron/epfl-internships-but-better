import { SegmentedControl } from '@mantine/core'
import { useDisplay } from '../hooks/useDisplay'
import { IconList, IconTable } from '@tabler/icons-react'

export default function DisplayModeSegmentedControl() {
  const { displayMode, setDisplayMode } = useDisplay()

  const data = [
    { label: 'List', value: 'list', icon: <IconList size={16} /> },
    { label: 'Table', value: 'table', icon: <IconTable size={16} /> },
  ]

  return (
    <SegmentedControl
      value={displayMode}
      onChange={(value) => setDisplayMode(value as 'list' | 'table')}
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
