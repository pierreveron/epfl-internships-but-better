import React, { createContext, useState, useEffect } from 'react'
import { displayModeFromLocalStorage } from '../../localStorage'
import { DisplayMode } from '../../types'

interface DisplayContextType {
  displayMode: DisplayMode
  setDisplayMode: (mode: DisplayMode) => void
}

export const DisplayContext = createContext<DisplayContextType | undefined>(undefined)

export const DisplayProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list')
  //   const { width } = useViewportSize()

  useEffect(() => {
    displayModeFromLocalStorage.get().then(setDisplayMode)
  }, [])

  const setDisplayModeWithStorage = (mode: DisplayMode) => {
    displayModeFromLocalStorage.set(mode).then(() => setDisplayMode(mode))
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
