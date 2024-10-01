import { createContext, useState, useEffect, useCallback } from 'react'
import { incrementFormattingCountInStorage } from '../utils/userUtils'
import { UserWithPremium } from '../../types'

interface UserContextType {
  user: UserWithPremium | null
  setUser: React.Dispatch<React.SetStateAction<UserWithPremium | null>>
  isLoading: boolean
  increaseFormattingCount: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithPremium | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const increaseFormattingCount = useCallback(() => {
    incrementFormattingCountInStorage().then((formattingCount) => {
      if (formattingCount) {
        setUser((user) => {
          if (user) return { ...user, formattingCount }
          return user
        })
      }
    })
  }, [])

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response: { user: UserWithPremium | null }) => {
      setUser(response.user)
      setIsLoading(false)
    })

    const listener = (request: { type: string; user: UserWithPremium | null }) => {
      if (request.type === 'AUTH_STATE_CHANGED') {
        setUser(request.user)
        setIsLoading(false)
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
    isLoading,
    increaseFormattingCount,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
