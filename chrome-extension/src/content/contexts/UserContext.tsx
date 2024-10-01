import { createContext, useState, useEffect, useCallback } from 'react'
import { UserWithPremium } from '../../types'
import { fetchUserData, incrementFormattingCountInStorage } from '../../utils/userUtils'
import { User } from 'firebase/auth'

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
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response: { user: User | null }) => {
      const user = response.user
      if (user && user.email) {
        fetchUserData(user.email).then(({ isPremium, formattingCount }) => {
          setUser({ ...user, isPremium, formattingCount })
          setIsLoading(false)
        })
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    const listener = (request: { type: string; user: User | null }) => {
      if (request.type === 'AUTH_STATE_CHANGED') {
        const user = request.user
        if (user && user.email) {
          fetchUserData(user.email).then(({ isPremium, formattingCount }) => {
            setUser({ ...user, isPremium, formattingCount })
          })
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }

      // Important! Return true to indicate you want to send a response asynchronously
      return true
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
