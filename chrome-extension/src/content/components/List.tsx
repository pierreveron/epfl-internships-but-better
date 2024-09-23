import {
  companyAtom,
  formatAtom,
  // formattingOffersAtom,
  // loadingOffersAtom,
  locationsAtom,
  minimumSalaryAtom,
  pageAtom,
  showOnlyFavoritesAtom,
  lengthAtom,
  showOnlyPositionsNotYetCompletedAtom,
  // sortStatusAtom,
} from '../atoms'
import { useFavoriteOffers, useHiddenOffers } from '../utils/hooks'
import classNames from 'classnames'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Offer } from '../../../../types'
import Card from '../components/Card'
import SortDropdown from './SortDropdown'
import { sortStatusAtom } from '../atoms'
import { useAside } from '../hooks/useAside'
import { useOfferActions } from '../hooks/useOfferActions'
import { useFilter } from '../hooks/useFilter'

export const PAGE_SIZE = 15

export type TableRecord = Offer & { favorite: boolean }

export default function List() {
  // const isFormatingOffers = useAtomValue(formattingOffersAtom)
  // const isLoadingOffers = useAtomValue(loadingOffersAtom)
  const selectableFormats = useAtomValue(formatAtom)
  const selectableLengths = useAtomValue(lengthAtom)
  const selectableLocations = useAtomValue(locationsAtom)
  const selectedCompany = useAtomValue(companyAtom)
  const showOnlyPositionsNotYetCompleted = useAtomValue(showOnlyPositionsNotYetCompletedAtom)
  const showOnlyFavorites = useAtomValue(showOnlyFavoritesAtom)
  const minimumSalary = useAtomValue(minimumSalaryAtom)

  const { isOfferFavorite, toggleFavoriteOffer } = useFavoriteOffers()
  const { isOfferHidden } = useHiddenOffers()

  const [page, setPage] = useAtom(pageAtom)
  // const [sortStatus, setSortStatus] = useAtom(sortStatusAtom)

  const { offer, setOpen, setOffer } = useAside()
  const { collapsedOffers, handleSelectOffer, handleReplayOffer, handleCollapseOffer } = useOfferActions()

  const { filteredData } = useFilter()

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

  const sortStatus = useAtomValue(sortStatusAtom)

  const sortedData = useMemo(() => {
    return sortBy(filteredData, sortStatus.columnAccessor, sortStatus.direction)
  }, [sortStatus, filteredData])

  const [records, setRecords] = useState<TableRecord[]>(
    sortedData.slice(0, PAGE_SIZE).map((d) => {
      return {
        ...d,
        favorite: isOfferFavorite(d),
      }
    }),
  )

  useEffect(() => {
    const d = filteredData
    // .filter((offer) => !isOfferHidden(offer))

    setOpen((open) => {
      if (open && offer && isOfferHidden(offer)) {
        const hiddenOfferIndex = d.findIndex((o) => o.number === offer!.number)
        const nextOfferIndex = hiddenOfferIndex === d.length - 1 ? hiddenOfferIndex - 1 : hiddenOfferIndex + 1

        if (nextOfferIndex < 0) {
          return false
        }
      }
      return open
    })

    setOffer((offer) => {
      if (offer && isOfferHidden(offer)) {
        const hiddenOfferIndex = d.findIndex((o) => o.number === offer!.number)
        const nextOfferIndex = hiddenOfferIndex === d.length - 1 ? hiddenOfferIndex - 1 : hiddenOfferIndex + 1

        if (nextOfferIndex < 0) {
          return null
        }

        const nextOffer = d[nextOfferIndex]
        const newPage = Math.floor(nextOfferIndex / PAGE_SIZE) + 1
        setPage(newPage)

        return { ...nextOffer }
      }
      return offer
    })
  }, [filteredData, isOfferHidden, isOfferFavorite, setOpen, setOffer, setPage, offer])

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE

    const visibleOffers = filteredData
    // .filter((offer) => !isOfferHidden(offer))
    const paginatedOffers = visibleOffers.slice(from, to)

    const records = paginatedOffers.map((d) => ({
      ...d,
      favorite: isOfferFavorite(d),
    }))

    setRecords(records)

    if (records.length > 0 && !offer) {
      console.log('opening first offer')
      setOffer(records[0])
      setOpen(true)
    }
  }, [page, filteredData, isOfferFavorite, offer, setOffer, setOpen])

  return (
    <div className="tw-w-4/5 tw-flex tw-flex-col tw-h-full">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <p>
          {filteredData.length === 0 && 'No offers correspond to your criteria'}
          {filteredData.length === 1 && '1 offer corresponds to your criteria'}
          {filteredData.length > 1 && (
            <>
              <span className="tw-font-bold">{filteredData.length}</span> offers correspond to your criteria
            </>
          )}
        </p>
        <SortDropdown />
      </div>
      <div className="tw-flex-1 tw-space-y-4 tw-overflow-y-auto tw-no-scrollbar tw-pb-4">
        {records.map((record) => (
          <Card
            key={record.number}
            record={record}
            isSelected={offer?.number === record.number}
            isCollapsed={collapsedOffers.has(record.number)}
            onSelect={() => handleSelectOffer(record)}
            onReplay={() => handleReplayOffer(record)}
            onCollapse={() => handleCollapseOffer(record)}
            onToggleFavorite={() => toggleFavoriteOffer(record)}
          />
        ))}
        <div className="tw-flex tw-flex-row tw-gap-2 tw-justify-center tw-flex-wrap">
          {[...Array(Math.ceil(filteredData.length / 15))].map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setPage(index + 1)
              }}
              className={classNames(
                'tw-rounded-full tw-border-none tw-h-8 tw-w-8',
                index + 1 === page
                  ? 'tw-bg-red-500 tw-text-white'
                  : 'tw-bg-transparent tw-text-gray-900 hover:tw-bg-gray-100',
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
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
