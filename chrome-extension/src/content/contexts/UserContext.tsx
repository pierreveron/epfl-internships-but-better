import { createContext, useState, useEffect } from 'react'
import { UserWithData } from '../../types'

interface UserContextType {
  user: UserWithData | null
  setUser: React.Dispatch<React.SetStateAction<UserWithData | null>>
  isLoading: boolean
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response: { user: UserWithData | null }) => {
      setUser(response.user)
      setIsLoading(false)
    })

    const listener = (request: { type: string; user: UserWithData | null }) => {
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

  return <UserContext.Provider value={{ user, setUser, isLoading }}>{children}</UserContext.Provider>
}
