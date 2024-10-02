import { useContext } from 'react'
import { AsideContext } from '../contexts/AsideContext'

export const useAside = () => {
  const context = useContext(AsideContext)
  if (context === undefined) {
    throw new Error('useAside must be used within an AsideProvider')
  }
  return context
}
