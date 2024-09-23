import { Offer } from '../../../../types'
import { formatSalary, formatToLabel } from '../utils/format'
import { getFlagEmojiWithName } from '../utils/countries'
import { formatLengthLabel } from '../utils/formatters'
import classNames from 'classnames'
import HeartIcon from './HeartIcon'
import ClockIcon from './icons/ClockIcon'
import LocationDotIcon from './icons/LocationDotIcon'
import MoneyBillIcon from './icons/MoneyBillIcon'
import BriefcaseIcon from './icons/BriefcaseIcon'
import CalendarIcon from './icons/CalendarIcon'
import CloseIcon from './icons/CloseIcon'
import ReplayIcon from './icons/ReplayIcon'
import { ActionIcon } from '@mantine/core'
import { Record } from '../contexts/PaginationContext'
import { useFavoriteOffers } from '../utils/hooks'

interface CardProps {
  record: Record
  isSelected: boolean
  isCollapsed: boolean
  onSelect: () => void
  onReplay: (record: Record) => void
  onCollapse: (record: Record) => void
  onToggleFavorite: (offer: Offer) => void
}

export default function Card({
  record,
  isSelected,
  isCollapsed,
  onSelect,
  onReplay,
  onCollapse,
  onToggleFavorite,
}: CardProps) {
  const { isOfferFavorite } = useFavoriteOffers()
  return (
    <div
      className={classNames(
        'tw-p-4 tw-border tw-border-solid tw-border-gray-100 tw-rounded-md tw-cursor-pointer hover:tw-border-gray-300 tw-transition tw-relative',
        isSelected && 'tw-border-gray-300',
        isCollapsed && 'tw-opacity-50',
      )}
      onClick={() => {
        if (!isCollapsed) {
          onSelect()
        }
      }}
    >
      <div className="tw-flex tw-flex-row tw-justify-between tw-items-start tw-gap-x-4">
        <div className="tw-mb-4">
          <h3 className="tw-text-xl tw-font-bold">{record.title}</h3>
          <p className="tw-text-base tw-font-medium tw-italic">{record.company}</p>
        </div>

        {isCollapsed ? (
          <ActionIcon
            onClick={(event) => {
              event.stopPropagation()
              onReplay(record)
            }}
            variant="subtle"
            color="blue"
            size="sm"
            className="tw-absolute tw-top-2 tw-right-2"
          >
            <ReplayIcon className="tw-h-6 tw-w-6" />
          </ActionIcon>
        ) : (
          <ActionIcon
            onClick={(event) => {
              event.stopPropagation()
              onCollapse(record)
            }}
            variant="subtle"
            color="gray"
            size="sm"
            className="tw-absolute tw-top-2 tw-right-2"
          >
            <CloseIcon className="tw-h-6 tw-w-6" />
          </ActionIcon>
        )}
      </div>

      {isCollapsed ? (
        <p className="tw-text-sm tw-text-gray-500">You won't see this offer again</p>
      ) : (
        <>
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
                  const today = new Date()
                  const [day, month, year] = record.creationDate.split('.')
                  const recordDate = new Date(+year, +month - 1, +day)
                  const diff = today.getTime() - recordDate.getTime()
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
                onToggleFavorite(record)
              }}
              variant="subtle"
              color="red"
              size="lg"
            >
              <HeartIcon checked={isOfferFavorite(record)} className="tw-h-5" />
            </ActionIcon>
          </div>
        </>
      )}
    </div>
  )
}
