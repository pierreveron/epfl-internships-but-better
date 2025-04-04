import { useState, useEffect } from 'react'
import { Button, Switch, Loader } from '@mantine/core'
import { IconExternalLink, IconBrandLinkedin, IconLogout, IconBrandGoogleFilled } from '@tabler/icons-react'
import { useUser } from '../content/hooks/useUser'
import { isExtensionEnabledFromLocalStorage } from '../localStorage'

export default function Popup() {
  const { user, isLoading: isUserLoading } = useUser()
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isOnJobBoard, setIsOnJobBoard] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    // Check if the current tab is on the IS-Academia job board
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url
      setIsOnJobBoard(currentUrl?.includes('isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab290') || false)
    })

    // Get the current state of the extension
    isExtensionEnabledFromLocalStorage.get().then((isEnabled) => {
      setIsEnabled(isEnabled)
    })
  }, [])

  const handleSignIn = async () => {
    setIsAuthLoading(true)
    chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
      setIsAuthLoading(false)
      if (response && response.error) {
        console.error('Sign-in failed:', response.error)
        alert('Sign-in failed')
      }
    })
  }

  const handleSignUp = async () => {
    setIsAuthLoading(true)
    chrome.runtime.sendMessage({ type: 'SIGN_UP' }, (response) => {
      setIsAuthLoading(false)
      if (response && response.error) {
        console.error('Sign-up failed:', response.error)
        alert('Sign-up failed. Make sure you are not already signed up.')
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
    isExtensionEnabledFromLocalStorage.set(checked)
    changeState(checked)
  }

  if (isUserLoading || isAuthLoading) {
    return (
      <div className="tw-w-96 tw-p-6 tw-bg-white tw-flex tw-flex-col tw-gap-4 tw-items-center tw-justify-center tw-min-h-[200px]">
        <Loader color="red" size="md" className="tw-mb-4" />
        {isAuthLoading && (
          <p className="tw-text-sm tw-text-gray-600 tw-text-center tw-max-w-[80%]">
            Please wait while we connect to Google...
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="tw-w-96 tw-p-6 tw-bg-white tw-text-black">
      <header className="tw-mb-4">
        <h1 className="tw-text-2xl tw-font-bold tw-text-center">
          <span className="tw-text-red-500">EPFL</span> internships but better
        </h1>
      </header>

      <main className="tw-space-y-4">
        {!user && (
          <div>
            <p className="tw-w-full tw-text-sm tw-text-gray-600 tw-text-left">
              Enjoy a better internship search on IS-Academia job board. Experience an improved UI and advanced filters
              (location, salary, keywords, sector...).
            </p>
          </div>
        )}

        {user ? (
          <>
            <Button w="100%" variant="outline" color="red" onClick={navigateToJobBoard} disabled={isOnJobBoard}>
              <IconExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
              {isOnJobBoard ? 'Currently on Job Board' : 'Open IS-Academia Job Board'}
            </Button>

            <div className="tw-w-full tw-text-sm tw-text-gray-600 tw-text-left">
              Logged in as <span className="tw-font-bold">{user.email}</span>
            </div>

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
          <div>
            <Button variant="filled" color="red" w="100%" onClick={handleSignUp}>
              <IconBrandGoogleFilled className="tw-w-4 tw-h-4 tw-mr-2" />
              Sign Up with your EPFL Google account
            </Button>
            <p className="tw-text-sm tw-text-gray-600 tw-text-center tw-mt-4">
              Already have an account?{' '}
              <button onClick={handleSignIn} className="tw-text-red-500">
                Sign In
              </button>
            </p>
          </div>
        )}
      </main>

      <footer className="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-200">
        <div className="tw-flex tw-justify-end tw-items-center">
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
