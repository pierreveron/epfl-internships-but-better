import { createContext, useState } from 'react'
import { Offer } from '../../../../types'

// type OfferWithFavorite = Offer & { favorite: boolean }

interface AsideContextType {
  open: boolean
  offer: Offer | null
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setOffer: React.Dispatch<React.SetStateAction<Offer | null>>
}

export const AsideContext = createContext<AsideContextType | undefined>(undefined)

export const AsideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true)
  const [offer, setOffer] = useState<Offer | null>(null)

  const value = {
    open,
    offer,
    setOpen,
    setOffer,
  }

  return <AsideContext.Provider value={value}>{children}</AsideContext.Provider>
}
