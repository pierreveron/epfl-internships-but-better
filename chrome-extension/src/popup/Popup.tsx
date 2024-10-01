import { useState, useEffect } from 'react'
import { Button, Switch } from '@mantine/core'
import {
  IconExternalLink,
  IconBrandLinkedin,
  IconBrandGithub,
  IconCheck,
  IconCrown,
  IconLogout,
  IconBrandGoogleFilled,
  IconHeart,
} from '@tabler/icons-react'
import { useUser } from '../content/hooks/useUser'
import UpgradeButton from '../content/components/UpgradeButton'

export default function Popup() {
  const { user, isLoading } = useUser()
  const [isOnJobBoard, setIsOnJobBoard] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    // Check if the current tab is on the IS-Academia job board
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url
      setIsOnJobBoard(currentUrl?.includes('isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab290') || false)
    })

    // Get the current state of the extension
    chrome.storage.local.get('isEnabled', (result) => {
      setIsEnabled(result.isEnabled !== false)
    })
  }, [])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
      if (response && response.error) {
        console.error('Sign-in failed:', response.error)
        alert('Sign-in failed')
      }
      setIsSigningIn(false)
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

  if (isLoading) {
    return <div className="loader"></div>
  }

  return (
    <div className="tw-w-96 tw-p-6 tw-bg-white tw-text-black">
      <header className="tw-mb-4">
        <h1 className="tw-text-2xl tw-font-bold">
          <span className="tw-text-red-500">EPFL</span> internships but better
        </h1>
      </header>

      <main className="tw-space-y-4">
        <div className="tw-space-y-1">
          <p className="tw-w-full tw-text-sm tw-text-gray-600 tw-text-left">
            Enjoy a better internship search on IS-Academia job board. Experience an improved UI and advanced filters.
          </p>
          {!user?.isPremium && (
            <>
              <p className="tw-w-full tw-text-sm tw-text-gray-600 tw-text-left">
                <span className="tw-font-bold">Free</span> version includes location filtering and 3 manual offers
                refreshes.
                <span className="tw-font-bold tw-ml-1">Upgrade to Premium</span> for unlimited refreshes and salary
                filtering.
              </p>
            </>
          )}
        </div>

        {user ? (
          <>
            <Button w="100%" variant="outline" color="red" onClick={navigateToJobBoard} disabled={isOnJobBoard}>
              <IconExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
              {isOnJobBoard ? 'Currently on Job Board' : 'Open IS-Academia Job Board'}
            </Button>

            <div className="tw-w-full tw-text-sm tw-text-gray-600 tw-text-left">
              Logged in as <span className="tw-font-bold">{user.email}</span>
            </div>

            {user.isPremium ? (
              <div className="tw-bg-gradient-to-r tw-from-red-500/30 tw-to-yellow-500/30 tw-p-4 tw-rounded-lg tw-text-gray-800 tw-border tw-border-red-200">
                <h2 className="tw-text-lg tw-font-semibold tw-mb-2 tw-flex tw-items-center">
                  <IconHeart className="tw-w-5 tw-h-5 tw-mr-2 tw-text-red-500" />
                  Thank You for Being Premium!
                </h2>
                <p className="tw-text-sm tw-text-left">
                  I appreciate your support. Enjoy unlimited refreshes and salary filtering! <br />
                  Good luck with your job search!
                </p>
              </div>
            ) : (
              <>
                <div className="tw-bg-gray-100 tw-p-4 tw-rounded-lg">
                  <h2 className="tw-text-lg tw-font-semibold tw-mb-2 tw-flex tw-items-center">
                    <IconCrown className="tw-w-5 tw-h-5 tw-mr-2 tw-text-yellow-500" />
                    Premium Features
                  </h2>
                  <ul className="tw-space-y-2">
                    <li className="tw-flex tw-items-center tw-text-sm">
                      <IconCheck className="tw-w-4 tw-h-4 tw-mr-2 tw-text-green-500" />
                      Filter and sort offers by salary
                    </li>
                    <li className="tw-flex tw-items-center tw-text-sm">
                      <IconCheck className="tw-w-4 tw-h-4 tw-mr-2 tw-text-green-500" />
                      Unlimited and automatic offers refreshs
                    </li>
                  </ul>
                </div>

                <UpgradeButton email={user.email ?? ''} fullWidth />
              </>
            )}

            <div className="tw-flex tw-items-center tw-justify-between">
              <span className="tw-text-sm tw-font-medium">Enable extension</span>
              <Switch
                color="red"
                checked={isEnabled}
                onChange={(event) => handleToggle(event.currentTarget.checked)}
                aria-label="Toggle extension"
              />
            </div>

            <Button variant="filled" color="red" w="100%" onClick={handleSignOut}>
              <IconLogout className="tw-w-4 tw-h-4 tw-mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="filled" color="red" w="100%" onClick={handleSignIn} loading={isSigningIn}>
            <IconBrandGoogleFilled className="tw-w-4 tw-h-4 tw-mr-2" />
            Sign In with Google
          </Button>
        )}
      </main>

      <footer className="tw-mt-6 tw-pt-4 tw-border-t tw-border-gray-200">
        <div className="tw-flex tw-justify-between tw-items-center">
          <a
            href="https://github.com/pierreveron/epfl-internships-but-better"
            target="_blank"
            rel="noopener noreferrer"
            className="tw-flex tw-items-center tw-text-sm tw-text-gray-600 hover:tw-text-black tw-transition-colors"
          >
            <IconBrandGithub className="tw-w-4 tw-h-4 tw-mr-1" />
            GitHub
          </a>
          <span className="tw-flex tw-items-center tw-text-sm tw-text-gray-600">
            Made by
            <a
              href="https://www.linkedin.com/in/pierre-veron/"
              target="_blank"
              rel="noopener noreferrer"
              className="tw-ml-1 tw-flex tw-items-center hover:tw-text-red-500 tw-transition-colors tw-text-red-400"
            >
              Pierre Véron
              <IconBrandLinkedin className="tw-w-4 tw-h-4 tw-ml-1" />
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
