import { useContext } from 'react'
import { DisplayContext } from '../contexts/DisplayContext'

export const useDisplay = () => {
  const context = useContext(DisplayContext)
  if (context === undefined) {
    throw new Error('useDisplay must be used within a DisplayProvider')
  }
  return context
}
