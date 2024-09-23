import React, { createContext, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  companyAtom,
  filteredOffersAtom,
  formatAtom,
  lengthAtom,
  locationsAtom,
  minimumSalaryAtom,
  nbCitiesSelectedAtom,
  showOnlyFavoritesAtom,
  showOnlyPositionsNotYetCompletedAtom,
} from '../atoms'
import { Offer } from '../../../../types'
import { useFavoriteOffers } from '../utils/hooks'
import { useData } from '../../utils/useData'

const NOT_SPECIFIED = 'Not specified'

interface FilterContextProps {
  filteredData: Offer[]
}

export const FilterContext = createContext<FilterContextProps | undefined>(undefined)

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useData()
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom)
  const selectableFormats = useAtomValue(formatAtom)
  const selectableLengths = useAtomValue(lengthAtom)
  const selectableLocations = useAtomValue(locationsAtom)
  const selectedCompany = useAtomValue(companyAtom)
  const showOnlyPositionsNotYetCompleted = useAtomValue(showOnlyPositionsNotYetCompletedAtom)
  const showOnlyFavorites = useAtomValue(showOnlyFavoritesAtom)
  const minimumSalary = useAtomValue(minimumSalaryAtom)
  const setFilteredOffers = useSetAtom(filteredOffersAtom)
  //   const sortStatus = useAtomValue(sortStatusAtom)
  const { isOfferFavorite } = useFavoriteOffers()

  const sortedData = useMemo(() => {
    return data
    // return sortBy(data, sortStatus.columnAccessor, sortStatus.direction)
  }, [data])

  const filteredData = useMemo(() => {
    let data = sortedData

    if (selectableFormats.some((f) => f.selected)) {
      data = data.filter((d) => {
        return (
          d.format.filter((f) => {
            return selectableFormats.find((sf) => sf.name === f)?.selected
          }).length > 0
        )
      })
    }

    if (minimumSalary !== undefined) {
      data = data.filter((d) => {
        return d.salary !== null && typeof d.salary !== 'string' && d.salary >= minimumSalary
      })
    }

    if (selectableLengths.some((f: { selected: boolean }) => f.selected)) {
      data = data.filter((d) => {
        return selectableLengths.find((sf: { name: string; selected: boolean }) => sf.name === d.length)?.selected
      })
    }

    if (selectedCompany) {
      data = data.filter((d) => d.company === selectedCompany)
    }

    if (showOnlyFavorites) {
      data = data.filter((d) => isOfferFavorite(d))
    }

    if (nbCitiesSelected !== 0) {
      data = data.filter((d) => {
        return (
          d.location.filter((l) => {
            return selectableLocations[l.country ?? NOT_SPECIFIED]?.find((c) => c.name === l.city)?.selected || false
          }).length > 0
        )
      })
    }

    if (showOnlyPositionsNotYetCompleted) {
      data = data.filter((d) => d.registered < d.positions)
    }

    setFilteredOffers(data)

    return data
  }, [
    sortedData,
    selectableFormats,
    minimumSalary,
    selectableLengths,
    selectedCompany,
    showOnlyFavorites,
    nbCitiesSelected,
    showOnlyPositionsNotYetCompleted,
    setFilteredOffers,
    isOfferFavorite,
    selectableLocations,
  ])

  return <FilterContext.Provider value={{ filteredData }}>{children}</FilterContext.Provider>
}
