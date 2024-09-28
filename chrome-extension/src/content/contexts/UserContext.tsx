import { createContext, useState, useEffect } from 'react'
import { UserWithPremium } from '../../types'

interface UserContextType {
  user: UserWithPremium | null
  setUser: React.Dispatch<React.SetStateAction<UserWithPremium | null>>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithPremium | null>(null)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response) => {
      setUser(response.user)
    })

    const listener = (request: { type: string; user: UserWithPremium | null }) => {
      if (request.type === 'AUTH_STATE_CHANGED' && request.user) {
        setUser(request.user)
      }
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  const value = {
    user,
    setUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
