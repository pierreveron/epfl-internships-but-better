import { useContext } from 'react'
import { OfferActionsContext } from '../contexts/OfferActionsContext'

export const useOfferActions = () => {
  const context = useContext(OfferActionsContext)
  if (!context) {
    throw new Error('useOfferActions must be used within an OfferActionsProvider')
  }
  return context
}
