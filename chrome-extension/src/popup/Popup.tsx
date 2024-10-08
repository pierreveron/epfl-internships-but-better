import { useState, useEffect } from 'react'
import { Button, Switch, CopyButton, TextInput } from '@mantine/core'
import {
  IconExternalLink,
  IconBrandLinkedin,
  IconCheck,
  IconCrown,
  IconLogout,
  IconBrandGoogleFilled,
  IconHeart,
  IconCopy,
  IconTicket,
  IconAdjustmentsHorizontal,
  IconCurrencyDollar,
  IconKey,
  IconBriefcase,
} from '@tabler/icons-react'
import { useUser } from '../content/hooks/useUser'
import { isExtensionEnabledFromLocalStorage } from '../localStorage'

export default function Popup() {
  const { user, isLoading } = useUser()
  const [isOnJobBoard, setIsOnJobBoard] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
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
    setIsSigningIn(true)
    chrome.runtime.sendMessage({ type: 'SIGN_IN', referralCode }, (response) => {
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
        <h1 className="tw-text-2xl tw-font-bold">
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

            <div className="tw-bg-gray-100 tw-border tw-p-4 tw-rounded-lg tw-my-4 tw-overflow-hidden">
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
                  <IconKey className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                  Filter by keywords (coming soon)
                </li>
                <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                  <IconBriefcase className="tw-w-5 tw-h-5 tw-mr-2 tw-text-gray-500 " />
                  Filter by sector (coming soon)
                </li>
              </ul>
              <p className="tw-text-sm tw-text-gray-600 tw-text-left tw-mt-4">
                Unlock these features for 3 days with a referral code – and keep them forever when you share your own
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
              <div className="tw-border-yellow-500 tw-border-2 tw-rounded-lg tw-mb-4 tw-overflow-hidden">
                <h2 className="tw-bg-gradient-to-r tw-from-yellow-400 tw-to-orange-500 tw-p-4 tw-text-xl tw-font-bold tw-flex tw-items-center tw-text-white">
                  <IconCrown className="tw-w-6 tw-h-6 tw-mr-2" />
                  Premium Features
                </h2>
                <ul className="tw-p-4 tw-space-y-2 tw-bg-gray-100">
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold">
                    <IconCheck className="tw-w-5 tw-h-5 tw-mr-2 tw-text-green-500" />
                    Filter and sort offers by salary
                  </li>
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                    <IconCheck className="tw-w-5 tw-h-5 tw-mr-2 tw-text-green-500 " />
                    Unlimited and automatic offers updates
                  </li>
                  <li className="tw-flex tw-items-center tw-text-sm tw-text-gray-800 tw-font-semibold tw-text-left">
                    <IconCheck className="tw-w-5 tw-h-5 tw-mr-2 tw-text-green-500 " />
                    New upcoming features (email summary, etc.)
                  </li>
                </ul>

                <div className="tw-bg-blue-50 tw-p-3 tw-border-y tw-border-y-blue-200 ">
                  <h3 className="tw-text-md tw-font-semibold tw-mb-2 tw-flex tw-items-center tw-text-blue-600">
                    <IconTicket className="tw-w-5 tw-h-5 tw-mr-2 tw-text-blue-600" />
                    Refer a Friend to unlock
                  </h3>
                  <p className="tw-mb-3 tw-text-sm tw-text-gray-800 tw-text-left">
                    Share your code below and unlock premium features when a friend uses it at signin!
                  </p>
                  <div className="tw-bg-white tw-border tw-border-blue-200 tw-p-2 tw-rounded-md tw-flex tw-items-center tw-justify-between">
                    <p className="tw-text-sm">{user.affiliateCode}</p>
                    <CopyButton value={user.affiliateCode}>
                      {({ copied, copy }) => (
                        <Button color={copied ? 'teal' : 'blue'} onClick={copy} size="xs" variant="subtle">
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
              <p className="tw-text-sm tw-text-gray-600 tw-text-left tw-whitespace-nowrap tw-mt-1 tw-mb-4">
                Using a referral code will unlock all filters for 3 days!
              </p>
              <Button variant="filled" color="red" w="100%" onClick={handleSignIn} loading={isSigningIn}>
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
