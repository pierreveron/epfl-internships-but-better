import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const isAsideMaximizedAtom = atom<boolean>(false)

export const displayModeAtom = atomWithStorage<'list' | 'table'>('displayMode', 'list')
