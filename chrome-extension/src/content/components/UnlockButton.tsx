import { Button } from '@mantine/core'
import { IconLockOpen } from '@tabler/icons-react'

export default function UnlockButton() {
  const handleUnlock = () => {
    chrome.runtime.sendMessage({ action: 'openPopup' }, (response) => {
      if (response && response.error) {
        alert('Please open the extension popup manually to see how to unlock all filters.')
      }
    })
  }

  return (
    <Button onClick={handleUnlock} variant="light" color="red" leftSection={<IconLockOpen size={18} />}>
      Unlock all filters
    </Button>
  )
}
