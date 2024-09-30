import React, { createContext, useState, useEffect } from 'react'
import { getStorageData, setStorageData } from '../utils/storage'

type DisplayMode = 'list' | 'table'

interface DisplayContextType {
  displayMode: DisplayMode
  setDisplayMode: (mode: DisplayMode) => void
}

export const DisplayContext = createContext<DisplayContextType | undefined>(undefined)

export const DisplayProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list')
  //   const { width } = useViewportSize()

  useEffect(() => {
    getStorageData<DisplayMode>('displayMode', 'list').then(setDisplayMode)
  }, [])

  const setDisplayModeWithStorage = (mode: DisplayMode) => {
    setStorageData('displayMode', mode).then(() => setDisplayMode(mode))
  }

  // useEffect(() => {
  //   if (width <= 992 && isAsideMaximized) {
  //     setIsAsideMaximized(false)
  //     return
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [width])

  return (
    <DisplayContext.Provider value={{ displayMode, setDisplayMode: setDisplayModeWithStorage }}>
      {children}
    </DisplayContext.Provider>
  )
}
