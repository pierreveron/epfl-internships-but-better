import { useContext } from 'react'
import { DisplayContext } from '../providers/DisplayProvider'

export const useDisplay = () => {
  const context = useContext(DisplayContext)
  if (context === undefined) {
    throw new Error('useDisplay must be used within a DisplayProvider')
  }
  return context
}
