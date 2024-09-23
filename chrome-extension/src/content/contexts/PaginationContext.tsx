import { useAtomValue } from 'jotai'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import {
  companyAtom,
  formatAtom,
  // formattingOffersAtom,
  // loadingOffersAtom,
  locationsAtom,
  minimumSalaryAtom,
  showOnlyFavoritesAtom,
  lengthAtom,
  showOnlyPositionsNotYetCompletedAtom,
  // sortStatusAtom,
} from '../atoms'
import { useFavoriteOffers } from '../utils/hooks'
import { Offer } from '../../../../types'
import { useSort } from '../hooks/useSort'
import { useAside } from '../hooks/useAside'

type Record = Offer & {
  favorite: boolean
}

interface PaginationContextProps {
  records: Record[]
  page: number
  setPage: (page: number) => void
  pageSize: number
}

export const PaginationContext = createContext<PaginationContextProps | undefined>(undefined)

export const PaginationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = useState(1)
  const pageSize = 15
  const { isOfferFavorite } = useFavoriteOffers()
  const { sortedData } = useSort()
  const { offer, setOffer, setOpen } = useAside()

  //   const { selectableLocations, selectableFormats, selectableLengths, selectedCompany, showOnlyPositionsNotYetCompleted, showOnlyFavorites, minimumSalary } = useFilter()
  // const isFormatingOffers = useAtomValue(formattingOffersAtom)
  // const isLoadingOffers = useAtomValue(loadingOffersAtom)
  const selectableFormats = useAtomValue(formatAtom)
  const selectableLengths = useAtomValue(lengthAtom)
  const selectableLocations = useAtomValue(locationsAtom)
  const selectedCompany = useAtomValue(companyAtom)
  const showOnlyPositionsNotYetCompleted = useAtomValue(showOnlyPositionsNotYetCompletedAtom)
  const showOnlyFavorites = useAtomValue(showOnlyFavoritesAtom)
  const minimumSalary = useAtomValue(minimumSalaryAtom)

  useEffect(() => {
    setPage(1)
  }, [
    selectableLocations,
    selectableFormats,
    selectableLengths,
    selectedCompany,
    showOnlyPositionsNotYetCompleted,
    showOnlyFavorites,
    minimumSalary,
    setPage,
  ])

  const records = useMemo<Record[]>(() => {
    const from = (page - 1) * pageSize
    const to = from + pageSize
    return sortedData.slice(from, to).map((d) => {
      return {
        ...d,
        favorite: isOfferFavorite(d),
      }
    })
  }, [page, pageSize, sortedData, isOfferFavorite])

  useEffect(() => {
    if (records.length > 0) {
      console.log('opening first offer')
      setOffer(records[0])
      setOpen(true)
    }
  }, [offer, records, setOffer, setOpen])

  return (
    <PaginationContext.Provider value={{ records, page, setPage, pageSize }}>{children}</PaginationContext.Provider>
  )
}
