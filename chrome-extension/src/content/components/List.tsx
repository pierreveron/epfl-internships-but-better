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
import { getFlagEmojiWithName } from '../utils/countries'
import { formatSalary, formatToLabel } from '../utils/format'
import { useFavoriteOffers, useHiddenOffers } from '../utils/hooks'
import classNames from 'classnames'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Offer } from '../../../../types'
import HeartIcon from './HeartIcon'
import { formatLengthLabel } from './LengthsCheckboxes'
import ClockIcon from './icons/ClockIcon'
import LocationDotIcon from './icons/LocationDotIcon'
import MoneyBillIcon from './icons/MoneyBillIcon'
import BriefcaseIcon from './icons/BriefcaseIcon'
import CalendarIcon from './icons/CalendarIcon'
import { ActionIcon } from '@mantine/core'

export const PAGE_SIZE = 15

const NOT_SPECIFIED = 'Not specified'

// const sortBy = (data: Offer[], columnAccessor: string) => {
//   let dataSorted = data
//   if (columnAccessor === 'company') {
//     dataSorted = data.sort((a, b) => {
//       return a.company.localeCompare(b.company)
//     })
//   } else if (columnAccessor === 'creationDate') {
//     dataSorted = data.sort((a, b) => {
//       return (
//         new Date(a.creationDate.split('.').reverse().join('-')).getTime() -
//         new Date(b.creationDate.split('.').reverse().join('-')).getTime()
//       )
//     })
//   } else if (columnAccessor === 'salary') {
//     dataSorted = data.sort((a, b) => {
//       // Check if salary is a string
//       if (typeof a.salary === 'string' || typeof b.salary === 'string') {
//         return 0
//       }

//       if (a.salary === null) {
//         return 1
//       }
//       if (b.salary === null) {
//         return -1
//       }
//       return a.salary - b.salary
//     })
//   }

//   return dataSorted
// }

export type TableRecord = Offer & { favorite: boolean }

export default function Table({ data }: { data: Offer[] }) {
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

  const { favoriteOffers, isOfferFavorite, toggleFavoriteOffer } = useFavoriteOffers()

  const { hiddenOffers, isOfferHidden } = useHiddenOffers()

  const [page, setPage] = useAtom(pageAtom)
  // const [sortStatus, setSortStatus] = useAtom(sortStatusAtom)

  useEffect(() => {
    setPage(1)
  }, [
    // sortStatus,
    selectableLocations,
    selectableFormats,
    selectableLengths,
    selectedCompany,
    showOnlyPositionsNotYetCompleted,
    showOnlyFavorites,
    minimumSalary,
  ])

  const sortedData = useMemo(() => {
    // return sortBy(data, sortStatus.columnAccessor)
    return data
  }, [
    // sortStatus.columnAccessor,
    data,
  ])

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
    showOnlyFavorites,
    showOnlyPositionsNotYetCompleted,
    selectableLocations,
    nbCitiesSelected,
    selectableFormats,
    minimumSalary,
    selectableLengths,
    selectedCompany,
  ])

  useEffect(() => {
    let d = filteredData

    // if (sortStatus.direction === 'desc') {
    //   d = d.slice().reverse()
    // }

    setAside((aside) => {
      if (aside.open && aside.offer && isOfferHidden(aside.offer)) {
        // Find the next offer after the current one
        d = d.filter((offer) => offer.number === aside.offer!.number || !isOfferHidden(offer))

        const hiddenOfferIndex = d.findIndex((o) => o.number === aside.offer!.number)

        console.log('hiddenOfferIndex', hiddenOfferIndex)

        let nextOfferIndex
        if (hiddenOfferIndex === d.length - 1) {
          nextOfferIndex = hiddenOfferIndex - 1
        } else {
          nextOfferIndex = hiddenOfferIndex + 1
        }

        if (nextOfferIndex < 0) {
          return {
            open: false,
            offer: null,
          }
        }

        console.log('nextOfferIndex', nextOfferIndex)
        const nextOffer = d[nextOfferIndex]

        const newPage = Math.floor(nextOfferIndex / PAGE_SIZE) + 1
        console.log('newPage', newPage)
        setPage(newPage)

        return {
          open: true,
          offer: {
            ...nextOffer,
            favorite: isOfferFavorite(nextOffer),
          },
        }
      }
      return aside
    })
  }, [hiddenOffers])

  useEffect(() => {
    if (records.length === 0) {
      return
    }
    if (!offer)
      setAside({
        open: true,
        offer: records[0],
      })
  }, [records])

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE

    let d = filteredData

    d = d.filter((offer) => !isOfferHidden(offer))

    // if (sortStatus.direction === 'desc') {
    //   d = d.slice().reverse()
    // }

    d = d.slice(from, to)

    // add favorite property if present in favoriteInternships
    const records = d.map((d) => {
      return {
        ...d,
        favorite: isOfferFavorite(d),
      }
    })

    setRecords(records)
  }, [
    page,
    filteredData,
    //  sortStatus.direction,
    favoriteOffers,
    hiddenOffers,
  ])

  const date = new Date()

  return (
    <div className="tw-h-full">
      <p className="tw-mb-6">
        {filteredData.length === 0 && 'No offers correspond to your criteria'}
        {filteredData.length === 1 && '1 offer corresponds to your criteria'}
        {filteredData.length > 1 && (
          <>
            <span className="tw-font-bold">{filteredData.length}</span> offers correspond to your criteria
          </>
        )}
      </p>
      <div className="tw-space-y-4 tw-h-full tw-overflow-y-auto tw-no-scrollbar">
        {records.map((record) => {
          return (
            <div
              className={classNames(
                'tw-p-4 tw-border tw-border-solid tw-border-gray-100 tw-rounded-md tw-cursor-pointer hover:tw-border-gray-300 tw-transition',
                offer && offer.number === record.number && 'tw-border-gray-300',
              )}
              key={record.number}
              onClick={() => {
                setAside({
                  open: true,
                  offer: record,
                })
              }}
            >
              <div className="tw-mb-4">
                <h3 className="tw-text-xl tw-font-bold">{record.title}</h3>
                <p className="tw-text-base tw-font-medium tw-italic">{record.company}</p>
              </div>

              <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                <BriefcaseIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
                <p className="tw-text-gray-600 tw-text-sm">
                  {record.format.length > 0 ? (
                    record.format.map((format, index) => (
                      <span key={format} className={classNames(index != 0 && "before:tw-content-['_·_']")}>
                        {formatToLabel(format)}
                      </span>
                    ))
                  ) : (
                    <p className="tw-text-gray-600 tw-text-sm">Not specified</p>
                  )}
                </p>
              </div>

              <div className="tw-flex tw-flex-row tw-gap-2">
                <LocationDotIcon className="tw-w-4 tw-h-4 tw-fill-gray-900" />
                <p className="tw-flex tw-flex-row tw-gap-2">
                  {record.location.length > 0 ? (
                    record.location.map((location, index) => (
                      <p
                        key={index}
                        className={classNames(
                          'tw-text-gray-600 tw-text-sm tw-flex tw-flex-row tw-items-center tw-gap-x-2',
                          index != 0 && "before:tw-content-['_·_']",
                        )}
                      >
                        {location.city}
                        {location.country && `, ${location.country} ${getFlagEmojiWithName(location.country)}`}
                      </p>
                    ))
                  ) : (
                    <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">
                      Not specified
                    </p>
                  )}
                </p>
              </div>

              <div className="tw-flex tw-flex-row tw-gap-2 tw-mt-4">
                <p className="tw-text-neutral-700 tw-text-sm tw-py-1 tw-px-2 tw-bg-neutral-200 tw-rounded tw-w-fit tw-flex tw-flex-row tw-items-center tw-gap-x-2">
                  <ClockIcon className="tw-w-4 tw-h-4 tw-fill-neutral-700" />
                  {record.length ? formatLengthLabel(record.length) : 'Not specified'}
                </p>

                {record.salary && (
                  <p className="tw-text-neutral-700 tw-text-sm tw-py-1 tw-px-2 tw-bg-neutral-200 tw-rounded tw-w-fit tw-flex tw-flex-row tw-items-center tw-gap-x-2">
                    <MoneyBillIcon className="tw-w-4 tw-h-4 tw-fill-neutral-700" />
                    {formatSalary(record.salary)}
                  </p>
                )}
              </div>

              <div className="tw-flex tw-flex-row tw-justify-between tw-items-center">
                <div className="tw-flex tw-flex-row tw-gap-2 tw-mt-4 tw-items-center">
                  <CalendarIcon className="tw-w-4 tw-h-4 tw-fill-gray-600" />

                  <p className="tw-text-gray-600 tw-text-sm">
                    {(() => {
                      const [day, month, year] = record.creationDate.split('.')
                      const recordDate = new Date(+year, +month - 1, +day)
                      const diff = date.getTime() - recordDate.getTime()
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                      if (days === 0) {
                        return 'Today'
                      }
                      if (days === 1) {
                        return 'Yesterday'
                      }

                      if (days < 7) {
                        return `${days} days ago`
                      }

                      return recordDate.toLocaleDateString('fr-FR')
                    })()}
                  </p>
                </div>

                <ActionIcon
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleFavoriteOffer(record)
                  }}
                  variant="subtle"
                  color="red"
                  size="lg"
                >
                  <HeartIcon checked={record.favorite} className="tw-h-5" />
                </ActionIcon>
              </div>
            </div>
          )
        })}
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
