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
} from '@tabler/icons-react'
import { useUser } from '../content/hooks/useUser'
import UpgradeButton from '../content/components/UpgradeButton'
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
      <div className="tw-w-96 tw-p-6 tw-bg-white tw-flex tw-items-center tw-justify-center">
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
              (location, salary, ...). <span className="tw-font-bold">Sign in with a Google account</span> to start
              using the extension.
            </p>
            <h2 className="tw-text-base tw-text-gray-600 tw-font-semibold tw-mt-2 tw-flex tw-items-center">
              Unlock all features
            </h2>
            <p className="tw-w-full tw-text-sm tw-text-gray-600 tw-text-left">
              <span className="tw-font-bold">Free</span> version includes location filtering and offers need to be
              refreshed manually up to 3 times. <span className="tw-font-bold">Premium</span> version unlocks automatic
              and unlimited refreshes and salary filtering. You can{' '}
              <span className="tw-font-bold">upgrade after signing in</span> for only a{' '}
              <span className="tw-font-bold">10 CHF</span> one-time payment. No subscription, no hidden fees.
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

                <div className="tw-flex tw-items-center tw-justify-center tw-text-gray-600 tw-my-4">
                  {/* <div className="tw-flex-grow tw-h-px tw-bg-white"></div> */}
                  <p className="tw-mx-4">OR</p>
                  {/* <div className="tw-flex-grow tw-h-px tw-bg-white/30"></div> */}
                </div>

                <div className="tw-mx-4 tw-mb-4">
                  <UpgradeButton email={user.email ?? ''} fullWidth />
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
          <>
            <TextInput
              leftSection={<IconTicket size={16} />}
              placeholder="Enter referral code (optional)"
              value={referralCode}
              onChange={(event) => setReferralCode(event.currentTarget.value)}
              className="tw-mb-2"
            />
            <Button variant="filled" color="red" w="100%" onClick={handleSignIn} loading={isSigningIn}>
              <IconBrandGoogleFilled className="tw-w-4 tw-h-4 tw-mr-2" />
              Sign In with Google
            </Button>
          </>
        )}
      </main>

      <footer className="tw-mt-6 tw-pt-4 tw-border-t tw-border-gray-200">
        <div className="tw-flex tw-justify-end tw-items-center">
          {/* <a
            href="https://github.com/pierreveron/epfl-internships-but-better"
            target="_blank"
            rel="noopener noreferrer"
            className="tw-flex tw-items-center tw-text-sm tw-text-gray-600 hover:tw-text-black tw-transition-colors"
          >
            <IconBrandGithub className="tw-w-4 tw-h-4 tw-mr-1" />
            GitHub
          </a> */}
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
