import { useEffect, useState } from 'react'
import { ISA_JOB_BOARD_URL } from '../utils/constants'
import classNames from 'classnames'
import { getCurrentTab } from '../utils/chrome-helpers'
import { fetchPortalCell } from '../utils/scraping'

export default function Popup() {
  const [isError, setIsError] = useState(false)
  const [isOnIsaJobBoard, setIsOnIsaJobBoard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [offersCount, setOffersCount] = useState<number | null>(null)

  const [offersLoaded, setOffersLoaded] = useState<number>(0)

  useEffect(() => {
    async function fetchOffersCount() {
      const portalCell = await fetchPortalCell()
      console.log('portalCell', portalCell)

      const offers = portalCell.querySelectorAll('tr').slice(1)

      setOffersCount(offers.length)
    }

    if (!isOnIsaJobBoard) return

    fetchOffersCount()
  }, [isOnIsaJobBoard])

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.error) {
        setIsError(true)
      }

      if (request.offersCount) {
        setOffersCount(request.offersCount)
      }

      if (request.offersLoaded) {
        setOffersLoaded(request.offersLoaded)
      }
    })
  }, [])

  useEffect(() => {
    async function checkIfOnIsaJobBoard() {
      const tab = await getCurrentTab()

      if (tab?.url === ISA_JOB_BOARD_URL) {
        setIsOnIsaJobBoard(true)
      }
    }

    checkIfOnIsaJobBoard()
  }, [])

  return (
    <div className="tw-space-y-4">
      <h1 className="tw-text-2xl tw-whitespace-nowrap">
        <span className="tw-text-[red]">EPFL</span> internships but better
      </h1>

      <div className="tw-space-y-2">
        <p className="tw-text-sm tw-text-gray-500 tw-text-left">
          This extension will automatically extract the job offers from IS-Academia and display them in a more
          user-friendly way.
        </p>

        <p className="tw-text-sm tw-text-gray-500 tw-text-left">
          You will be able to filter them correctly by location, period, duration, salary, etc.
        </p>

        <p className="tw-text-sm tw-text-gray-500 tw-text-left">You will also be able to save your favorite offers.</p>
      </div>

      <p className="tw-text-sm tw-text-gray-500 tw-text-left">
        {offersCount ? `${offersCount} offers found` : 'Click on the buttons below to start.'}
      </p>

      {isError ? (
        <p className="tw-text-sm tw-text-red-500 tw-text-left">An error occurred, please reload the page.</p>
      ) : (
        <div>
          <div className="tw-flex tw-flex-col tw-gap-7">
            <div className="tw-flex tw-flex-row tw-gap-4">
              <label
                className={classNames(
                  'tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-[red] tw-rounded-full tw-h-8 tw-aspect-square tw-flex tw-justify-center tw-items-center',
                  isOnIsaJobBoard && 'tw-bg-[red] tw-text-white tw-opacity-40',
                )}
              >
                1
              </label>
              <div aria-disabled={isOnIsaJobBoard} className="tw-group tw-relative tw-flex-1">
                <input
                  disabled={isOnIsaJobBoard}
                  className={classNames(
                    'tw-rounded-md tw-bg-[red] tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[red] tw-cursor-pointer tw-w-full',
                    'disabled:tw-cursor-not-allowed disabled:tw-opacity-40',
                  )}
                  type="button"
                  value="Go to IS-Academia job board"
                  onClick={() => chrome.tabs.create({ url: ISA_JOB_BOARD_URL })}
                />

                <span className="tw-pointer-events-none tw-absolute tw--bottom-5 tw-left-0 tw-right-0 tw-w-full tw-opacity-0 tw-transition-opacity group-hover:tw-opacity-100 group-aria-disabled:tw-opacity-0">
                  You may need to login.
                </span>
              </div>
            </div>

            <div className="tw-flex tw-flex-row tw-gap-4">
              <label className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-[red] tw-rounded-full tw-w-8 tw-h-8 tw-flex tw-justify-center tw-items-center">
                2
              </label>

              <div aria-disabled={isOnIsaJobBoard} className="tw-group tw-relative tw-flex-1">
                <input
                  disabled={!isOnIsaJobBoard}
                  className={classNames(
                    'tw-rounded-md tw-bg-[red] tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-[red] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[red] tw-w-full',
                    'disabled:tw-cursor-not-allowed disabled:tw-opacity-40',
                    isLoading ? 'tw-cursor-wait' : 'tw-cursor-pointer',
                  )}
                  type="button"
                  value={
                    isLoading
                      ? offersCount
                        ? `${offersLoaded}/${offersCount} offers extracted`
                        : 'Waiting...'
                      : 'Let the magic happen'
                  }
                  onClick={async () => {
                    const tab = await getCurrentTab()

                    if (!tab || !tab.id || tab.url !== ISA_JOB_BOARD_URL) return

                    chrome.scripting.executeScript({
                      target: { tabId: tab.id },
                      files: ['content/index.js'],
                    })

                    chrome.runtime.sendMessage({ message: 'init' })

                    setIsLoading(true)
                  }}
                />

                <span className="tw-pointer-events-none tw-absolute tw--bottom-5 tw-left-0 tw-right-0 tw-w-full tw-opacity-0 tw-transition-opacity group-aria-disabled:tw-opacity-0">
                  Click on the button above first.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
