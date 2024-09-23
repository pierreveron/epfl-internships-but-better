import { useFavoriteOffers } from '../utils/hooks'
import classNames from 'classnames'
import Card from '../components/Card'
import SortDropdown from './SortDropdown'
import { useAside } from '../hooks/useAside'
import { useOfferActions } from '../hooks/useOfferActions'
import { usePagination } from '../hooks/usePagination'
import { useFilter } from '../hooks/useFilter'
import { useEffect, useRef } from 'react'

export default function List() {
  const { offer: offerAside } = useAside()
  const { page, setPage, pageSize } = usePagination()
  const { filteredData: filteredOffers } = useFilter()
  const { records } = usePagination()

  const { collapsedOffers, handleSelectOffer, handleReplayOffer, handleCollapseOffer } = useOfferActions()
  const { toggleFavoriteOffer } = useFavoriteOffers()

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [page])

  return (
    <div className="tw-w-4/5 tw-flex tw-flex-col tw-h-full">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <p>
          {filteredOffers.length === 0 && 'No offers correspond to your criteria'}
          {filteredOffers.length === 1 && '1 offer corresponds to your criteria'}
          {filteredOffers.length > 1 && (
            <>
              <span className="tw-font-bold">{filteredOffers.length}</span> offers correspond to your criteria
            </>
          )}
        </p>
        <SortDropdown />
      </div>
      <div ref={listRef} className="tw-flex-1 tw-space-y-4 tw-overflow-y-auto tw-no-scrollbar tw-pb-4">
        {records.map((record) => (
          <Card
            key={record.number}
            record={record}
            isSelected={record.number === offerAside?.number}
            isCollapsed={collapsedOffers.has(record.number)}
            onSelect={() => handleSelectOffer(record)}
            onReplay={() => handleReplayOffer(record)}
            onCollapse={() => handleCollapseOffer(record)}
            onToggleFavorite={() => toggleFavoriteOffer(record)}
          />
        ))}
        <div className="tw-flex tw-flex-row tw-gap-2 tw-justify-center tw-flex-wrap">
          {[...Array(Math.ceil(filteredOffers.length / pageSize))].map((_, index) => (
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
