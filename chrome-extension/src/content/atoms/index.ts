import { TableRecord } from '../components/Table'
import { SelectableCity, SelectableFormat, SelectableLength } from '../types'
import { atom } from 'jotai'
import { Offer } from '../../../../types'
import { DataTableSortStatus } from 'mantine-datatable'
import { atomWithStorage } from 'jotai/utils'

export const formattingOffersAtom = atom<boolean>(false)
export const loadingOffersAtom = atom<boolean>(true)

export const locationsAtom = atom<Record<string, SelectableCity[]>>({})

export const formatAtom = atom<SelectableFormat[]>([
  { name: 'internship', selected: false },
  { name: 'project', selected: false },
])
export const lengthAtom = atom<SelectableLength[]>([])
export const companyAtom = atom<string | null>(null)
export const showOnlyPositionsNotYetCompletedAtom = atom<boolean>(false)
export const showOnlyFavoritesAtom = atom<boolean>(false)
export const minimumSalaryAtom = atom<number | undefined>(undefined)
export const isAsideMaximizedAtom = atom<boolean>(false)

export const filteredOffersAtom = atom<Offer[]>([])

export const sortStatusAtom = atom<DataTableSortStatus<TableRecord>>({
  columnAccessor: 'creationDate',
  direction: 'desc',
})
export const pageAtom = atom<number>(1)

export const nbCitiesSelectedAtom = atom((get) => {
  const locations = get(locationsAtom)
  return Object.keys(locations).reduce((acc, country) => {
    const cities = locations[country]
    const selectedCities = cities?.filter((city) => city.selected)
    return acc + (selectedCities?.length || 0)
  }, 0)
})

export const displayModeAtom = atomWithStorage<'list' | 'table'>('displayMode', 'list')
