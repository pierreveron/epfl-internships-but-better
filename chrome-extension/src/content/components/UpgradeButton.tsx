import { Button } from '@mantine/core'
import { resetUserData } from '../../utils/userUtils'
import { IconCrown } from '@tabler/icons-react'

export default function UpgradeButton({ email }: { email: string }) {
  return (
    <Button
      onClick={() => {
        resetUserData()
        chrome.tabs.create({
          url: `https://epfl-internships-but-better.lemonsqueezy.com/buy/55677453-102d-4b40-9002-82c5d54176b8?checkout[email]=${email}`,
        })
      }}
      variant="gradient"
      gradient={{ from: 'gold', to: 'orange' }}
      leftSection={<IconCrown size={18} />}
    >
      Upgrade to Premium
    </Button>
  )
}
