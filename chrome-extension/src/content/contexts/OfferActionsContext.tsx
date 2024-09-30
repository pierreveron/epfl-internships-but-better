import { createContext, useCallback, useState } from 'react'
import { Offer } from '../../types'
import { useAside } from '../hooks/useAside'
import { useData } from './DataContext'

interface OfferActionsContextType {
  collapsedOffers: Set<string>
  handleSelectOffer: (record: Offer) => void
  handleReplayOffer: (record: Offer) => void
  handleCollapseOffer: (record: Offer) => void
  toggleCollapseOffer: (record: Offer) => void
}

export const OfferActionsContext = createContext<OfferActionsContextType | undefined>(undefined)

export const OfferActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsedOffers, setCollapsedOffers] = useState<Set<string>>(new Set())
  const { toggleHiddenOffer } = useData()
  const { setOffer } = useAside()

  const handleSelectOffer = useCallback(
    (record: Offer) => {
      setOffer(record)
    },
    [setOffer],
  )

  const handleReplayOffer = useCallback(
    (record: Offer) => {
      setCollapsedOffers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(record.number)
        return newSet
      })
      toggleHiddenOffer(record)
    },
    [toggleHiddenOffer],
  )

  const handleCollapseOffer = useCallback(
    (record: Offer) => {
      setCollapsedOffers((prev) => new Set(prev).add(record.number))
      toggleHiddenOffer(record)
    },
    [toggleHiddenOffer],
  )

  const toggleCollapseOffer = useCallback(
    (record: Offer) => {
      setCollapsedOffers((prev) => {
        const newSet = new Set(prev)
        newSet.has(record.number) ? newSet.delete(record.number) : newSet.add(record.number)
        return newSet
      })
      toggleHiddenOffer(record)
    },
    [toggleHiddenOffer],
  )

  const value = {
    collapsedOffers,
    handleSelectOffer,
    handleReplayOffer,
    handleCollapseOffer,
    toggleCollapseOffer,
  }

  return <OfferActionsContext.Provider value={value}>{children}</OfferActionsContext.Provider>
}
