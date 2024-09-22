import {
  asideAtom,
  companyAtom,
  filteredOffersAtom,
  formatAtom,
  // formattingOffersAtom,
  // loadingOffersAtom,
  locationsAtom,
  minimumSalaryAtom,
  nbCitiesSelectedAtom,
  pageAtom,
  showOnlyFavoritesAtom,
  lengthAtom,
  showOnlyPositionsNotYetCompletedAtom,
  // sortStatusAtom,
} from '../atoms'
import { useFavoriteOffers, useHiddenOffers } from '../utils/hooks'
import classNames from 'classnames'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Offer } from '../../../../types'
import Card from '../components/Card'
import SortDropdown from './SortDropdown'
import { sortStatusAtom } from '../atoms'

export const PAGE_SIZE = 15

const NOT_SPECIFIED = 'Not specified'

export type TableRecord = Offer & { favorite: boolean }

export default function List({ data }: { data: Offer[] }) {
  // const isFormatingOffers = useAtomValue(formattingOffersAtom)
  // const isLoadingOffers = useAtomValue(loadingOffersAtom)
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom)
  const selectableFormats = useAtomValue(formatAtom)
  const selectableLengths = useAtomValue(lengthAtom)
  const selectableLocations = useAtomValue(locationsAtom)
  const selectedCompany = useAtomValue(companyAtom)
  const showOnlyPositionsNotYetCompleted = useAtomValue(showOnlyPositionsNotYetCompletedAtom)
  const showOnlyFavorites = useAtomValue(showOnlyFavoritesAtom)
  const minimumSalary = useAtomValue(minimumSalaryAtom)
  const [{ offer }, setAside] = useAtom(asideAtom)
  const setFilteredOffers = useSetAtom(filteredOffersAtom)

  const { isOfferFavorite, toggleFavoriteOffer } = useFavoriteOffers()
  const { isOfferHidden, toggleHiddenOffer } = useHiddenOffers()

  const [page, setPage] = useAtom(pageAtom)
  // const [sortStatus, setSortStatus] = useAtom(sortStatusAtom)

  const [collapsedOffers, setCollapsedOffers] = useState<Set<string>>(new Set())

  const handleCollapseOffer = useCallback(
    (record: TableRecord) => {
      setCollapsedOffers((prev) => new Set(prev).add(record.number))
      toggleHiddenOffer(record)
    },
    [toggleHiddenOffer],
  )

  const handleReplayOffer = useCallback(
    (record: TableRecord) => {
      setCollapsedOffers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(record.number)
        return newSet
      })
      toggleHiddenOffer(record)
    },
    [toggleHiddenOffer],
  )

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

  const [sortStatus] = useAtom(sortStatusAtom)

  const sortedData = useMemo(() => {
    return sortBy(data, sortStatus.columnAccessor)
  }, [sortStatus.columnAccessor, data])

  const [records, setRecords] = useState<TableRecord[]>(
    sortedData.slice(0, PAGE_SIZE).map((d) => {
      return {
        ...d,
        favorite: isOfferFavorite(d),
      }
    }),
  )

  // filter sorted data on the registered column
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

  useEffect(() => {
    const d = filteredData
    // .filter((offer) => !isOfferHidden(offer))

    setAside((aside) => {
      if (aside.open && aside.offer && isOfferHidden(aside.offer)) {
        const hiddenOfferIndex = d.findIndex((o) => o.number === aside.offer!.number)
        const nextOfferIndex = hiddenOfferIndex === d.length - 1 ? hiddenOfferIndex - 1 : hiddenOfferIndex + 1

        if (nextOfferIndex < 0) {
          return { open: false, offer: null }
        }

        const nextOffer = d[nextOfferIndex]
        const newPage = Math.floor(nextOfferIndex / PAGE_SIZE) + 1
        setPage(newPage)

        return {
          open: true,
          offer: { ...nextOffer, favorite: isOfferFavorite(nextOffer) },
        }
      }
      return aside
    })
  }, [filteredData, isOfferHidden, isOfferFavorite, setAside, setPage])

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
      setAside({
        open: true,
        offer: records[0],
      })
    }
  }, [page, filteredData, isOfferFavorite, offer, setAside])

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
            onSelect={() => setAside({ open: true, offer: record })}
            onReplay={handleReplayOffer}
            onCollapse={handleCollapseOffer}
            onToggleFavorite={toggleFavoriteOffer}
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

const sortBy = (data: Offer[], sortCriteria: string): Offer[] => {
  if (!sortCriteria) return data

  const dataSorted = [...data]
  if (sortCriteria === 'company') {
    dataSorted.sort((a, b) => a.company.localeCompare(b.company))
  } else if (sortCriteria === 'creationDate') {
    dataSorted.sort((a, b) => {
      return (
        new Date(b.creationDate.split('.').reverse().join('-')).getTime() -
        new Date(a.creationDate.split('.').reverse().join('-')).getTime()
      )
    })
  } else if (sortCriteria === 'salary') {
    dataSorted.sort((a, b) => {
      if (typeof a.salary === 'string' || typeof b.salary === 'string') {
        return 0
      }
      if (a.salary === null) return 1
      if (b.salary === null) return -1
      return b.salary - a.salary
    })
  }
  return dataSorted
}
