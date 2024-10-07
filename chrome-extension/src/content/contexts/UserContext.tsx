import { createContext, useState, useEffect, useCallback } from 'react'
import { incrementFormattingCountInStorage } from '../utils/userUtils'
import { UserWithData, UserData } from '../../types'
import { userDataFromLocalStorage } from '../../localStorage'
import { User } from 'firebase/auth'

interface UserContextType {
  user: UserWithData | null
  setUser: React.Dispatch<React.SetStateAction<UserWithData | null>>
  isLoading: boolean
  increaseFormattingCount: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

const MAX_CACHE_TIME = 1000 * 60 * 60 * 24 * 7 // 1 week

const getUserData = async (): Promise<UserData> => {
  console.log('Getting first user data from storage')
  const userDataFromStorage = await userDataFromLocalStorage.get()
  if (userDataFromStorage && Date.now() - userDataFromStorage.timestamp < MAX_CACHE_TIME) {
    console.log('Got user data from storage', userDataFromStorage)

    return userDataFromStorage
  }
  console.log('Fetching user data from firestore via service worker')

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'FETCH_USER_DATA' }, (response: { userData: UserData }) => {
      resolve(response.userData)
    })
  })
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const increaseFormattingCount = useCallback(() => {
    incrementFormattingCountInStorage().then((formattingCount) => {
      if (formattingCount) {
        setUser((user) => (user ? { ...user, formattingCount } : user))
      }
    })
  }, [])

  useEffect(() => {
    const updateUser = (user: User | null) => {
      if (user) {
        getUserData().then((userData) => {
          setUser({ ...user, ...userData })
          setIsLoading(false)
        })
      } else {
        setUser(null)
        setIsLoading(false)
      }
    }

    chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response: { user: User | null }) => {
      updateUser(response.user)
    })

    const listener = (request: { type: string; user: User | null }) => {
      if (request.type === 'AUTH_STATE_CHANGED') {
        updateUser(request.user)
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
