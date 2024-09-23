import { getFlagEmojiWithName } from '../utils/countries'
import { formatSalary, formatToLabel } from '../utils/format'
import { ActionIcon, Anchor, Button } from '@mantine/core'
import HeartIcon from './HeartIcon'
import ArrowRightLongIcon from './icons/ArrowRightLongIcon'
import BriefcaseIcon from './icons/BriefcaseIcon'
import ClockIcon from './icons/ClockIcon'
// import EyeSlashIcon from "./icons/EyeSlashIcon";
import LocationDotIcon from './icons/LocationDotIcon'
import { formatLengthLabel } from '../utils/formatters'
import MoneyBillIcon from './icons/MoneyBillIcon'
import classNames from 'classnames'
import { useAside } from '../hooks/useAside'
import { useFavoriteOffers } from '../utils/hooks'

const getFirstValidWebsite = (websites: string): string => {
  const validWebsites = websites
    .split(';')
    .map((t) => t.trim())
    .filter((t) => !t.startsWith('www.http'))

  if (validWebsites.length === 0) return ''

  const firstWebsite = validWebsites[0]
  return firstWebsite.startsWith('http') || firstWebsite.startsWith('www.') ? firstWebsite : `http://${firstWebsite}`
}

export default function OfferDescription() {
  const { offer } = useAside()

  const { toggleFavoriteOffer, isOfferFavorite } = useFavoriteOffers()

  const countryName = (language: string) => {
    switch (language) {
      case 'french':
        return 'France'
      case 'german':
        return 'Germany'
      case 'english':
        return 'United Kingdom'
      default:
        return ''
    }
  }

  const formatLanguageLevel = (label: string) => {
    switch (label) {
      case 'Elémentaire' || 'Basic':
        return 'Basic'
      case 'Intermédiaire' || 'Intermediate':
        return 'Intermediate'
      case 'Avancé' || 'Advanced':
        return 'Advanced'
      default:
        return undefined
    }
  }

  if (!offer) {
    return (
      <div className="tw-pl-4 tw-flex tw-items-center tw-justify-center tw-h-full tw-w-full">
        <p className="tw-text-xl tw-text-gray-500">No offer selected</p>
      </div>
    )
  }

  return (
    <div className="tw-px-4 tw-py-4 tw-h-full tw-w-full tw-overflow-y-auto">
      <p className="tw-text-gray-500 tw-text-sm">{offer.number}</p>

      <div className="tw-mb-4">
        <h2 className="tw-text-2xl tw-font-bold">{offer.title}</h2>
        <p className="tw-text-lg tw-font-medium tw-italic">
          {offer.companyInfo.website ? (
            <a
              className="tw-no-underline hover:tw-underline tw-transition-colors"
              href={getFirstValidWebsite(offer.companyInfo.website)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {offer.company}
            </a>
          ) : (
            offer.company
          )}
        </p>
      </div>

      <div className="tw-mb-4">
        <div className="tw-flex tw-flex-row tw-gap-2">
          <LocationDotIcon className="tw-w-4 tw-h-4 tw-fill-gray-900" />
          <p className="tw-flex tw-flex-row tw-gap-2">
            {offer.location.length > 0 ? (
              offer.location.map((location, index) => (
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
              <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">Not specified</p>
            )}
          </p>
        </div>
        {/* <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <LocationDotIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Location</p>
          <div className="tw-col-start-2 tw-flex tw-flex-row tw-gap-2">
            {asideOffer && asideoffer.location.length > 0 ? (
              asideoffer.location.map((location, index) => (
                <p
                  key={index}
                  className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md"
                >
                  {location.city}
                  {location.country &&
                    `, ${location.country} ${getFlagEmojiWithName(
                      location.country
                    )}`}
                </p>
              ))
            ) : (
              <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">
                Not specified
              </p>
            )}
          </div>
        </div> */}

        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
          <BriefcaseIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p className="tw-text-gray-600 tw-text-sm">
            {offer.format.length > 0 ? (
              offer.format.map((format, index) => (
                <span key={format} className={classNames(index != 0 && "before:tw-content-['_·_']")}>
                  {formatToLabel(format)}
                </span>
              ))
            ) : (
              <p className="tw-text-gray-600 tw-text-sm">Not specified</p>
            )}
          </p>
        </div>

        <div className="tw-flex tw-flex-row tw-gap-2 tw-mt-4">
          <p className="tw-text-neutral-700 tw-text-sm tw-py-1 tw-px-2 tw-bg-neutral-200 tw-rounded tw-w-fit tw-flex tw-flex-row tw-items-center tw-gap-x-2">
            <ClockIcon className="tw-w-4 tw-h-4 tw-fill-neutral-700" />
            {offer.length ? formatLengthLabel(offer.length) : 'Not specified'}
          </p>

          {offer.salary && (
            <p className="tw-text-neutral-700 tw-text-sm tw-py-1 tw-px-2 tw-bg-neutral-200 tw-rounded tw-w-fit tw-flex tw-flex-row tw-items-center tw-gap-x-2">
              <MoneyBillIcon className="tw-w-4 tw-h-4 tw-fill-neutral-700" />
              {formatSalary(offer.salary)}
            </p>
          )}
        </div>

        {/* <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <BriefcaseIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Position type</p>
          <div className="tw-col-start-2 tw-flex tw-flex-row tw-gap-2">
            {asideOffer && asideoffer.format.length > 0 ? (
              asideoffer.format.map((format, index) => (
                <p
                  key={index}
                  className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md"
                >
                  {formatToLabel(format)}
                </p>
              ))
            ) : (
              <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">
                Not specified
              </p>
            )}
          </div>
        </div> */}

        {/* <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <ClockIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Length</p>

          <p className="tw-col-start-2 tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md tw-w-fit">
            {asideoffer.length
              ? formatLengthLabel(asideOffer.length)
              : "Not specified"}
          </p>
        </div> */}

        {/* <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <MoneyBillIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Salary</p>

          <p className="tw-col-start-2 tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md tw-w-fit">
            {formatSalary(asideoffer.salary ?? null)}
          </p>
        </div> */}
      </div>

      <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
        <Button
          data-offer-id={offer.id}
          id="register-button"
          component="a"
          href="https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab300"
          target="_blank"
          w={200}
          size="md"
          rightSection={<ArrowRightLongIcon className="tw-w-4 tw-h-4 tw-fill-white" />}
        >
          Register
        </Button>

        <ActionIcon
          onClick={() => {
            if (offer) {
              toggleFavoriteOffer(offer)
            }
          }}
          variant="subtle"
          color="red"
          size="xl"
        >
          <HeartIcon checked={isOfferFavorite(offer)} className="tw-h-[1.4rem]" />
        </ActionIcon>
        {/* <ActionIcon
          onClick={() => {
            if (asideOffer) {
              toggleHiddenOffer(asideOffer);
            }
          }}
          variant="subtle"
          color="gray"
          size="xl"
        >
          <EyeSlashIcon className="tw-w-6 tw-fill-gray-900" />
        </ActionIcon> */}

        <Anchor
          data-offer-id={offer.id}
          id="view-button"
          href="https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab300"
          target="_blank"
          underline="never"
        >
          View original offer
        </Anchor>
      </div>

      <div className="tw-space-y-4 tw-mt-4">
        <div>
          <h3 className="tw-text-xl tw-font-medium">Description</h3>
          <p className="tw-text-gray-900 tw-whitespace-pre-line" style={{ wordBreak: 'break-word' }}>
            {offer.description ?? '⊘'}
          </p>
        </div>

        <div>
          <h3 className="tw-text-xl tw-font-medium">Required skills</h3>
          <p className="tw-text-gray-900 tw-whitespace-pre-line" style={{ wordBreak: 'break-word' }}>
            {offer.requiredSkills ?? '⊘'}
          </p>
        </div>

        <div>
          <h3 className="tw-text-xl tw-font-medium tw-mb-2">Language</h3>
          <div className="tw-col-start-2 tw-flex tw-flex-row tw-gap-2">
            {offer &&
            Object.entries(offer.languages ?? {})
              .map(([language, level]) => [language, formatLanguageLevel(level)])
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .filter(([_, level]) => level !== undefined).length > 0 ? (
              Object.entries(offer.languages ?? {})
                .map(([language, level]) => [language, formatLanguageLevel(level)])
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, level]) => level !== undefined)
                .map(([language, level], index) => (
                  <p
                    key={index}
                    className="tw-text-neutral-700 tw-text-sm tw-py-1 tw-px-2 tw-bg-neutral-200 tw-rounded tw-w-fit tw-flex tw-flex-row tw-items-center tw-gap-x-2"
                  >
                    <span>
                      {getFlagEmojiWithName(countryName(language!)) ??
                        `${language!.charAt(0).toUpperCase() + language!.slice(1)}:`}
                    </span>
                    <span>{level}</span>
                  </p>
                ))
            ) : (
              <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">Not specified</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="tw-text-xl tw-font-medium">Remarks</h3>
          <p className="tw-text-gray-900 tw-whitespace-pre-line" style={{ wordBreak: 'break-word' }}>
            {offer.remarks != '' ? offer.remarks : '⊘'}
          </p>
        </div>

        <div>
          <h3 className="tw-text-xl tw-font-medium">File</h3>
          {offer && offer.file !== null ? (
            <Anchor
              href={`https://isa.epfl.ch/imoniteur_ISAP/docs/!PORTAL14S.action/${encodeURI(
                offer.file.fileName,
              )}?ww_k_cell=2742535167&ww_x_action=FILE&ww_i_detailstage=${
                offer.file.detailId
              }&ww_x_filename=${encodeURIComponent(offer.file.fileName)}`}
              target="_blank"
              underline="never"
            >
              See the file
            </Anchor>
          ) : (
            <p className="tw-text-gray-900 tw-whitespace-pre-line">⊘</p>
          )}
        </div>
      </div>
    </div>
  )
}
