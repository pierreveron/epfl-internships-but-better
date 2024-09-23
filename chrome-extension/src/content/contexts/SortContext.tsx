import React, { createContext, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { sortStatusAtom } from '../atoms'
import { Offer } from '../../../../types'
import { useFilter } from '../hooks/useFilter'

interface SortContextType {
  sortedData: Offer[]
}

export const SortContext = createContext<SortContextType | undefined>(undefined)

export const SortProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { filteredData: data } = useFilter()
  const sortStatus = useAtomValue(sortStatusAtom)

  const sortedData = useMemo(() => {
    return sortBy(data, sortStatus.columnAccessor, sortStatus.direction)
  }, [sortStatus, data])

  return <SortContext.Provider value={{ sortedData }}>{children}</SortContext.Provider>
}

const sortBy = (data: Offer[], sortCriteria: string, direction: 'asc' | 'desc'): Offer[] => {
  if (!sortCriteria) return data

  const dataSorted = [...data]
  const multiplier = direction === 'asc' ? 1 : -1

  switch (sortCriteria) {
    case 'company':
      dataSorted.sort((a, b) => multiplier * a.company.localeCompare(b.company))
      break
    case 'creationDate':
      dataSorted.sort((a, b) => {
        return (
          multiplier *
          (new Date(a.creationDate.split('.').reverse().join('-')).getTime() -
            new Date(b.creationDate.split('.').reverse().join('-')).getTime())
        )
      })
      break
    case 'salary':
      dataSorted.sort((a, b) => {
        if (typeof a.salary === 'string' || typeof b.salary === 'string') {
          return 0
        }
        if (a.salary === null) return direction === 'asc' ? -1 : 1
        if (b.salary === null) return direction === 'asc' ? 1 : -1
        return multiplier * (a.salary - b.salary)
      })
      break
    case 'registered':
      dataSorted.sort((a, b) => multiplier * (a.registered - b.registered))
      break
    default:
      // If no valid sort criteria is provided, return the original data
      return data
  }

  return dataSorted
}
