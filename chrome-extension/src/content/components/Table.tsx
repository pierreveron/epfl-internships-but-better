import { formatSalary, formatToLabel } from '../utils/format'
import classNames from 'classnames'
import { DataTable } from 'mantine-datatable'
import { useEffect, useRef, useContext } from 'react'
import { usePrevious } from '@mantine/hooks'
import HeartIcon from './HeartIcon'
import { useAside } from '../hooks/useAside'
import { FilterContext } from '../contexts/FilterContext'
import { usePagination } from '../hooks/usePagination'
import { useSort } from '../hooks/useSort'
import { useOfferActions } from '../hooks/useOfferActions'
import CloseIcon from './icons/CloseIcon'
import ReplayIcon from './icons/ReplayIcon'
import { useData } from '../hooks/useData'

export default function Table() {
  const { selectableFormats } = useContext(FilterContext)!
  const { offer, setOffer: setAside } = useAside()
  const { toggleFavoriteOffer, isOfferFavorite, isOfferHidden } = useData()
  const { records, page, pageSize, setPage } = usePagination()
  const { sortStatus, setSortStatus, sortedData } = useSort()
  const previousPage = usePrevious(page)
  const { collapsedOffers, toggleCollapseOffer } = useOfferActions()

  const viewport = useRef<HTMLDivElement>(null)

  const scrollToBottom = () =>
    viewport.current!.scrollTo({
      top: viewport.current!.scrollHeight,
      behavior: 'smooth',
    })

  const scrollToTop = () =>
    viewport.current!.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

  useEffect(() => {
    if (previousPage === undefined) return
    if (previousPage < page) {
      setTimeout(() => {
        scrollToTop()
      }, 100)
    }
    if (previousPage > page) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [page, previousPage])

  return (
    <DataTable
      highlightOnHover
      highlightOnHoverColor="var(--mantine-color-red-1)"
      records={records}
      rowBackgroundColor={({ number }) => {
        if (offer && offer.number === number) {
          return 'var(--mantine-color-red-2)'
        }
        return undefined
      }}
      rowClassName={({ number }) => (collapsedOffers.has(number) ? 'tw-line-through tw-opacity-50' : '')}
      columns={[
        {
          accessor: 'favorite',
          render: (record) => (
            <HeartIcon
              checked={isOfferFavorite(record)}
              onClick={(event) => {
                // Prevent the row click event to be triggered
                event.stopPropagation()

                toggleFavoriteOffer(record)
              }}
            />
          ),
        },
        {
          accessor: 'title',
          title: 'Offer',
          width: '20%',
        },
        { accessor: 'company', sortable: true, width: '15%' },
        {
          accessor: 'location',
          render: ({ location }) => (
            <ul className="tw-list-none tw-space-y-1">
              {location.map((loc, index) => (
                <li key={index}>
                  {loc.city}
                  {loc.country && `, ${loc.country}`}
                </li>
              ))}
            </ul>
          ),
        },
        { accessor: 'number' },
        {
          accessor: 'format',
          render: ({ format }) => {
            const someFormatsSelected = selectableFormats.some((f) => f.selected)
            return (
              <ul className="tw-list-none tw-space-y-1">
                {format.map((f) => {
                  const selected = someFormatsSelected && !selectableFormats.find((sf) => sf.name === f)?.selected

                  return (
                    <li key={f}>
                      <p
                        className={classNames(
                          'tw-text-sm tw-py-1 tw-px-2  tw-rounded-md tw-whitespace-nowrap tw-w-fit',
                          !selected ? 'tw-bg-gray-200 tw-text-gray-600' : 'tw-bg-gray-50 tw-text-gray-300',
                        )}
                      >
                        {formatToLabel(f)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )
          },
        },
        // {
        //   accessor: "registered",
        //   textAlign: "center",
        //   title: "Candidates",
        // },
        // { accessor: "positions", textAlign: "center", title: "Places" },
        {
          accessor: 'professor',
          render: ({ professor, format }) => {
            if (format.includes('project') && professor === null) {
              return 'To find (if project)'
            }
            return professor
          },
        },
        { accessor: 'creationDate', sortable: true },
        { accessor: 'length' },
        {
          accessor: 'salary',
          sortable: true,
          render: ({ salary }) => formatSalary(salary),
        },
        {
          accessor: 'collapse',
          title: 'Hide',
          textAlign: 'center',
          render: (record) => (
            <button
              onClick={(event) => {
                event.stopPropagation()
                toggleCollapseOffer(record)
              }}
              className="tw-p-1 tw-rounded hover:tw-bg-gray-100"
            >
              {collapsedOffers.has(record.number) ? (
                <ReplayIcon className="tw-w-4 tw-h-4" />
              ) : (
                <CloseIcon className="tw-w-4 tw-h-4" />
              )}
            </button>
          ),
        },
      ]}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      totalRecords={sortedData.filter((offer) => !isOfferHidden(offer)).length}
      recordsPerPage={pageSize}
      page={page}
      onPageChange={(p) => setPage(p)}
      onRowClick={({ record }) => {
        setAside(record)
      }}
      scrollViewportRef={viewport}
    />
  )
}
