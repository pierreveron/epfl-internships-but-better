import { createContext, useState } from 'react'
import { Offer } from '../../../../types'

interface AsideContextType {
  offer: Offer | null
  setOffer: React.Dispatch<React.SetStateAction<Offer | null>>
}

export const AsideContext = createContext<AsideContextType | undefined>(undefined)

export const AsideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offer, setOffer] = useState<Offer | null>(null)

  const value = {
    offer,
    setOffer,
  }

  return <AsideContext.Provider value={value}>{children}</AsideContext.Provider>
}
