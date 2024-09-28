import { useState, useEffect } from 'react'
import { Button, Switch } from '@mantine/core'
import { IconCrown, IconExternalLink } from '@tabler/icons-react'
import { UserWithPremium } from '../types'

export default function Popup() {
  const [user, setUser] = useState<UserWithPremium | null>(null)
  const [isOnJobBoard, setIsOnJobBoard] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response) => {
      setUser(response.user)
    })

    // Check if the current tab is on the IS-Academia job board
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url
      setIsOnJobBoard(currentUrl?.includes('isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab290') || false)
    })

    const listener = (request: { type: string; user: UserWithPremium | null }) => {
      if (request.type === 'AUTH_STATE_CHANGED') {
        setUser(request.user)
      }
    }

    chrome.runtime.onMessage.addListener(listener)

    // Get the current state of the extension
    chrome.storage.local.get('isEnabled', (result) => {
      setIsEnabled(result.isEnabled !== false)
    })

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  const handleSignIn = async () => {
    chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
      if (response && response.error) {
        console.error('Sign-in failed:', response.error)
        alert('Sign-in failed')
      }
    })
  }

  const handleSignOut = async () => {
    chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, (response) => {
      if (response && response.error) {
        console.error('Sign-out failed:', response.error)
        alert('Sign-out failed')
      }
    })
  }

  const navigateToJobBoard = () => {
    chrome.tabs.create({ url: 'https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab290' })
  }

  const changeState = (enabled: boolean) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs.find((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'CHANGE_STATE', state: enabled ? 'ENABLED' : 'DISABLED' })
      }
    })
  }

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked)
    chrome.storage.local.set({ isEnabled: checked })
    changeState(checked)
  }

  return (
    <div className="tw-space-y-4 tw-p-4">
      <h1 className="tw-text-2xl tw-whitespace-nowrap">
        <span className="tw-text-[red]">EPFL</span> internships but better
      </h1>
      <p className="tw-text-sm tw-text-gray-500 tw-text-left">
        This extension enhances the IS-Academia job board experience. Open the IS-Academia job board to use the enhanced
        features.
      </p>
      <Button
        onClick={navigateToJobBoard}
        variant="outline"
        color="red"
        leftSection={<IconExternalLink size={18} />}
        fullWidth
        disabled={isOnJobBoard}
      >
        {isOnJobBoard ? 'Currently on Job Board' : 'Open IS-Academia Job Board'}
      </Button>
      <div className="tw-space-y-2">
        {user ? (
          <>
            <p>Welcome, {user.displayName}!</p>
            {!user.isPremium && (
              <Button
                onClick={() =>
                  chrome.tabs.create({
                    url: `https://epfl-internships-but-better.lemonsqueezy.com/buy/55677453-102d-4b40-9002-82c5d54176b8?checkout[email]=${user.email}`,
                  })
                }
                variant="gradient"
                gradient={{ from: 'gold', to: 'orange' }}
                leftSection={<IconCrown size={18} />}
              >
                Upgrade to Premium
              </Button>
            )}

            <div className="tw-flex tw-items-center tw-justify-between">
              <span className="tw-text-sm tw-text-gray-700">Enable extension</span>
              <Switch checked={isEnabled} onChange={(event) => handleToggle(event.currentTarget.checked)} />
            </div>

            <button
              onClick={handleSignOut}
              className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-shadow-sm tw-text-white tw-bg-red-600 hover:tw-bg-red-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-red-500"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-shadow-sm tw-text-white tw-bg-red-600 hover:tw-bg-red-700 focus:tw-outline-none focus:tw-ring-2 tw-ring-offset-2 tw-ring-red-500"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </div>
  )
}
