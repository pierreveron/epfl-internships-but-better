import { useState, useEffect } from 'react'
import { Button, Switch, CopyButton, TextInput } from '@mantine/core'
import {
  IconExternalLink,
  IconBrandLinkedin,
  IconCheck,
  IconLogout,
  IconBrandGoogleFilled,
  IconCopy,
  IconTicket,
  IconAdjustmentsHorizontal,
  IconCurrencyDollar,
  IconSearch,
  IconBriefcase,
} from '@tabler/icons-react'
import { useUser } from '../content/hooks/useUser'
import { isExtensionEnabledFromLocalStorage } from '../localStorage'

export default function Popup() {
  const { user, isLoading } = useUser()
  const [isOnJobBoard, setIsOnJobBoard] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [referralCode, setReferralCode] = useState('')

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
    chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
      if (response && response.error) {
        console.error('Sign-in failed:', response.error)
        alert('Sign-in failed')
      }
    })
  }

  const handleSignUp = async () => {
    chrome.runtime.sendMessage({ type: 'SIGN_UP', referralCode }, (response) => {
      if (response && response.error) {
        console.error('Sign-up failed:', response.error)
        alert('Sign-up failed')
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

  if (isLoading) {
    return (
      <div className="tw-w-auto tw-p-6 tw-bg-white tw-flex tw-items-center tw-justify-center">
        <div className="loader"></div>
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
              (location, salary, keywords, sector...).{' '}
            </p>

            <div className="tw-border tw-border-gray-200 tw-p-4 tw-rounded-lg tw-my-4 tw-overflow-hidden">
              <h2 className="tw-text-xl tw-font-bold tw-flex tw-items-center tw-text-gray-800">
                <IconAdjustmentsHorizontal className="tw-w-6 tw-h-6 tw-mr-2" />
                Premium filters
              </h2>
              <ul className="tw-space-y-2 tw-mt-4">
                <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold">
                  <IconCurrencyDollar className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500" />
                  Filter and sort offers by salary
                </li>
                <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                  <IconSearch className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                  Filter by keywords (coming soon)
                </li>
                <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                  <IconBriefcase className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                  Filter by sector (coming soon)
                </li>
              </ul>
              <p className="tw-text-sm tw-text-gray-600 tw-text-left tw-mt-4">
                Unlock these features for 3 days with a referral code – and unlock them forever when you share your own
                code with another friend!
              </p>
            </div>
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

            {user.hasReferredSomeone ? (
              <div className="tw-border tw-border-gray-200 tw-p-4 tw-rounded-lg tw-my-4">
                <h2 className="tw-text-lg tw-font-semibold tw-mb-2 tw-flex tw-items-center">
                  <IconCheck className="tw-w-5 tw-h-5 tw-mr-2" />
                  All Filters Unlocked
                </h2>
                <ul className="tw-space-y-2 tw-mt-4">
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold">
                    <IconCurrencyDollar className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500" />
                    Filter and sort offers by salary
                  </li>
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                    <IconSearch className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                    Filter by keywords (coming soon)
                  </li>
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                    <IconBriefcase className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                    Filter by sector (coming soon)
                  </li>
                </ul>
                <div className="tw-bg-gray-50 tw-p-3 tw-rounded-md tw-mt-4">
                  <p className="tw-text-sm tw-text-gray-700 tw-text-left">
                    Thanks for sharing. Enjoy full access to all filters. You can still share your code with your
                    friends to unlock premium features for them!
                  </p>
                  <div className="tw-mt-2 tw-border tw-bg-white tw-border-gray-200 tw-p-2 tw-rounded-md tw-flex tw-items-center tw-justify-between">
                    <p className="tw-text-sm">{user.referralCode}</p>
                    <CopyButton value={user.referralCode}>
                      {({ copied, copy }) => (
                        <Button color={copied ? 'gray' : 'red'} onClick={copy} size="xs" variant="subtle">
                          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          <span className="tw-ml-1">{copied ? 'Copied' : 'Copy'}</span>
                        </Button>
                      )}
                    </CopyButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tw-border tw-border-gray-200 tw-p-4 tw-rounded-lg tw-my-4 tw-overflow-hidden">
                <h2 className="tw-text-xl tw-font-bold tw-flex tw-items-center tw-text-gray-800">
                  <IconAdjustmentsHorizontal className="tw-w-6 tw-h-6 tw-mr-2" />
                  Premium filters
                </h2>
                <ul className="tw-space-y-2 tw-mt-4">
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold">
                    <IconCurrencyDollar className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500" />
                    Filter and sort offers by salary
                  </li>
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                    <IconSearch className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                    Filter by keywords (coming soon)
                  </li>
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                    <IconBriefcase className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                    Filter by sector (coming soon)
                  </li>
                </ul>
                <div className="tw-bg-red-50 tw-p-3 tw-rounded-md tw-mt-4">
                  <h3 className="tw-text-md tw-font-semibold tw-mb-2 tw-flex tw-items-center tw-text-red-600">
                    <IconTicket className="tw-w-5 tw-h-5 tw-mr-2 tw-text-red-600" />
                    Refer a Friend to unlock
                  </h3>
                  <p className="tw-mb-3 tw-text-sm tw-text-gray-800 tw-text-left">
                    Share your referral code below and unlock premium features when a friend uses it at sign-up.
                  </p>
                  <div className="tw-bg-white tw-border tw-border-gray-200 tw-p-2 tw-rounded-md tw-flex tw-items-center tw-justify-between">
                    <p className="tw-text-sm">{user.referralCode}</p>
                    <CopyButton value={user.referralCode}>
                      {({ copied, copy }) => (
                        <Button color={copied ? 'gray' : 'red'} onClick={copy} size="xs" variant="subtle">
                          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          <span className="tw-ml-1">{copied ? 'Copied' : 'Copy'}</span>
                        </Button>
                      )}
                    </CopyButton>
                  </div>
                </div>
              </div>
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
          <div>
            <div>
              <TextInput
                leftSection={<IconTicket size={16} />}
                placeholder="Enter referral code (optional)"
                value={referralCode}
                onChange={(event) => setReferralCode(event.currentTarget.value)}
              />
              <p className="tw-text-sm tw-text-gray-600 tw-text-left tw-whitespace-nowrap tw-mt-1 tw-mb-3">
                Using a referral code will unlock all filters for 3 days!
              </p>
              <Button variant="filled" color="red" w="100%" onClick={handleSignUp}>
                <IconBrandGoogleFilled className="tw-w-4 tw-h-4 tw-mr-2" />
                Sign Up with your EPFL Google account
              </Button>
            </div>
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
