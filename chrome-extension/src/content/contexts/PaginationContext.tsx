import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Offer } from '../../../../types'
import { useSort } from '../hooks/useSort'
import { useAside } from '../hooks/useAside'
import { FilterContext } from './FilterContext'

export type Record = Offer

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
  const { sortedData } = useSort()
  const { setOffer } = useAside()

  //   const { selectableLocations, selectableFormats, selectableLengths, selectedCompany, showOnlyPositionsNotYetCompleted, showOnlyFavorites, minimumSalary } = useFilter()
  // const isFormatingOffers = useAtomValue(formattingOffersAtom)
  // const isLoadingOffers = useAtomValue(loadingOffersAtom)

  const {
    selectableFormats,
    selectableLengths,
    selectableLocations,
    selectedCompany,
    showOnlyFavorites,
    minimumSalary,
  } = useContext(FilterContext)!

  useEffect(() => {
    setPage(1)
  }, [
    selectableLocations,
    selectableFormats,
    selectableLengths,
    selectedCompany,
    showOnlyFavorites,
    minimumSalary,
    setPage,
  ])

  const records = useMemo<Record[]>(() => {
    const from = (page - 1) * pageSize
    const to = from + pageSize
    return sortedData.slice(from, to)
  }, [page, pageSize, sortedData])

  useEffect(() => {
    if (records.length > 0) {
      console.log('opening first offer')
      setOffer(records[0])
    }

    if (records.length === 0) {
      setOffer(null)
    }
  }, [records, setOffer])

  return (
    <PaginationContext.Provider value={{ records, page, setPage, pageSize }}>{children}</PaginationContext.Provider>
  )
}
