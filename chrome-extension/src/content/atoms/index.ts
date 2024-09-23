import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { DataTableSortStatus } from 'mantine-datatable'
import { TableRecord } from '../components/Table'

export const formattingOffersAtom = atom<boolean>(false)
export const loadingOffersAtom = atom<boolean>(true)
export const isAsideMaximizedAtom = atom<boolean>(false)

export const sortStatusAtom = atom<DataTableSortStatus<TableRecord>>({
  columnAccessor: 'creationDate',
  direction: 'desc',
})

export const displayModeAtom = atomWithStorage<'list' | 'table'>('displayMode', 'list')
