import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'

export default function Popup() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response) => {
      setUser(response.user)
    })

    const listener = (request: { type: string; user: User | null }) => {
      if (request.type === 'AUTH_STATE_CHANGED') {
        setUser(request.user)
      }
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  const handleSignIn = async () => {
    chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
      if (response.success) {
        chrome.tabs.reload()
      } else {
        console.error('Sign-in failed:', response.error)
      }
    })
  }

  const handleSignOut = async () => {
    chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, (response) => {
      if (response.success) {
        chrome.tabs.reload()
      } else {
        console.error('Sign-out failed:', response.error)
      }
    })
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
      <div className="tw-space-y-2">
        {user ? (
          <>
            <p>Welcome, {user.displayName}!</p>
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
