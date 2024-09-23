import { createContext, useCallback, useState } from 'react'
import { Offer } from '../../../../types'
import { useHiddenOffers } from '../utils/hooks'
import { useAside } from '../hooks/useAside'

interface OfferActionsContextType {
  collapsedOffers: Set<string>
  handleSelectOffer: (record: Offer) => void
  handleReplayOffer: (record: Offer) => void
  handleCollapseOffer: (record: Offer) => void
}

export const OfferActionsContext = createContext<OfferActionsContextType | undefined>(undefined)

export const OfferActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsedOffers, setCollapsedOffers] = useState<Set<string>>(new Set())
  const { toggleHiddenOffer } = useHiddenOffers()
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

  const value = {
    collapsedOffers,
    handleSelectOffer,
    handleReplayOffer,
    handleCollapseOffer,
  }

  return <OfferActionsContext.Provider value={value}>{children}</OfferActionsContext.Provider>
}
