import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const formattingOffersAtom = atom<boolean>(false)
export const loadingOffersAtom = atom<boolean>(true)
export const isAsideMaximizedAtom = atom<boolean>(false)

export const displayModeAtom = atomWithStorage<'list' | 'table'>('displayMode', 'list')
