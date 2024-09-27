import React, { createContext, useState, useMemo, useEffect } from 'react'
import { Offer } from '../../types'
import { useFavoriteOffers } from '../utils/hooks'
import { useData } from '../hooks/useData'
import { SelectableCity, SelectableFormat, SelectableLength } from '../types'

const NOT_SPECIFIED = 'Not specified'

interface FilterContextProps {
  filteredData: Offer[]
  selectableLocations: Record<string, SelectableCity[]>
  setSelectableLocations: React.Dispatch<React.SetStateAction<Record<string, SelectableCity[]>>>
  selectableFormats: SelectableFormat[]
  setSelectableFormats: React.Dispatch<React.SetStateAction<SelectableFormat[]>>
  selectableLengths: SelectableLength[]
  setSelectableLengths: React.Dispatch<React.SetStateAction<SelectableLength[]>>
  selectedCompany: string | null
  setSelectedCompany: React.Dispatch<React.SetStateAction<string | null>>
  showOnlyFavorites: boolean
  setShowOnlyFavorites: React.Dispatch<React.SetStateAction<boolean>>
  minimumSalary: number | undefined
  setMinimumSalary: React.Dispatch<React.SetStateAction<number | undefined>>
  nbCitiesSelected: number
}

export const FilterContext = createContext<FilterContextProps | undefined>(undefined)

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, citiesByCountry } = useData()
  const [selectableLocations, setSelectableLocations] = useState<Record<string, SelectableCity[]>>({})
  const [selectableFormats, setSelectableFormats] = useState<SelectableFormat[]>([
    { name: 'internship', selected: false },
    { name: 'project', selected: false },
  ])
  const [selectableLengths, setSelectableLengths] = useState<SelectableLength[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [minimumSalary, setMinimumSalary] = useState<number | undefined>(undefined)

  const { isOfferFavorite } = useFavoriteOffers()

  const nbCitiesSelected = useMemo(() => {
    return Object.values(selectableLocations).reduce((acc, cities) => {
      return acc + cities.filter((city) => city.selected).length
    }, 0)
  }, [selectableLocations])

  const filteredData = useMemo(() => {
    let filteredOffers = data

    // Apply filters
    if (selectableFormats.some((f) => f.selected)) {
      filteredOffers = filteredOffers.filter((d) =>
        d.format.some((f) => selectableFormats.find((sf) => sf.name === f)?.selected),
      )
    }

    if (minimumSalary !== undefined) {
      filteredOffers = filteredOffers.filter(
        (d) => d.salary !== null && typeof d.salary !== 'string' && d.salary >= minimumSalary,
      )
    }

    if (selectableLengths.some((f) => f.selected)) {
      filteredOffers = filteredOffers.filter((d) => selectableLengths.find((sf) => sf.name === d.length)?.selected)
    }

    if (selectedCompany) {
      filteredOffers = filteredOffers.filter((d) => d.company === selectedCompany)
    }

    if (showOnlyFavorites) {
      filteredOffers = filteredOffers.filter((d) => isOfferFavorite(d))
    }

    if (nbCitiesSelected !== 0) {
      filteredOffers = filteredOffers.filter((d) =>
        d.location.some(
          (l) => selectableLocations[l.country ?? NOT_SPECIFIED]?.find((c) => c.name === l.city)?.selected,
        ),
      )
    }

    return filteredOffers
  }, [
    data,
    selectableFormats,
    minimumSalary,
    selectableLengths,
    selectedCompany,
    showOnlyFavorites,
    nbCitiesSelected,
    isOfferFavorite,
    selectableLocations,
  ])

  useEffect(() => {
    setSelectableLengths(
      Array.from(new Set(data.flatMap((d) => d.length))).map((length) => {
        return { name: length, selected: false }
      }) as SelectableLength[],
    )
  }, [data, setSelectableLengths])

  useEffect(() => {
    setSelectableLocations(citiesByCountry)
  }, [citiesByCountry, setSelectableLocations])

  const contextValue = {
    filteredData,
    selectableLocations,
    setSelectableLocations,
    selectableFormats,
    setSelectableFormats,
    selectableLengths,
    setSelectableLengths,
    selectedCompany,
    setSelectedCompany,
    showOnlyFavorites,
    setShowOnlyFavorites,
    minimumSalary,
    setMinimumSalary,
    nbCitiesSelected,
  }

  return <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>
}
