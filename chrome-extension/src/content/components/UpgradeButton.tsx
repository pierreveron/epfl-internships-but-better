import { Button } from '@mantine/core'
import { resetUserData } from '../utils/userUtils'
import { getUpgradeUrl } from '../../serviceWorker/firebase/firebaseFunctions'
import { IconCrown } from '@tabler/icons-react'
import { useState } from 'react'

export default function UpgradeButton({ email, fullWidth = false }: { email: string; fullWidth?: boolean }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    let response
    try {
      response = await getUpgradeUrl()
    } catch (error) {
      console.error('Failed to get upgrade URL:', error)
      throw error
    } finally {
      setIsLoading(false)
    }

    const { url } = response.data as { url: string | null }
    if (!url) {
      alert(
        'Upgrade is not active yet. Please try again later or contact Pierre Véron on Linkedin (https://www.linkedin.com/in/pierre-veron/) or by email (pierre.veron@epfl.ch).',
      )
      return
    }
    const checkoutUrl = `${url}?checkout[email]=${email}`
    resetUserData()
    console.log('Opening checkout URL:', checkoutUrl)
    window.open(checkoutUrl, '_blank')!.focus()
  }

  return (
    <Button
      onClick={handleUpgrade}
      variant="gradient"
      gradient={{ from: 'gold', to: 'orange' }}
      leftSection={<IconCrown size={18} />}
      loading={isLoading}
      fullWidth={fullWidth}
    >
      Upgrade to Premium for only 10 CHF
    </Button>
  )
}
