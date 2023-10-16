import { useEffect, useState } from 'react'

export default function Content() {
  const [offersCount, setOffersCount] = useState<number | null>(null)
  const [offersLoaded, setOffersLoaded] = useState<number>(0)

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.offersCount) {
        setOffersCount(request.offersCount)
      }

      if (request.offersLoaded) {
        setOffersLoaded(request.offersLoaded)
      }
    })
  }, [])

  return (
    <div
      className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity tw-z-[1000]"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <p className="tw-text-4xl tw-text-white">{offersCount ? `${offersLoaded}/${offersCount}` : 'Waiting...'}</p>
    </div>
  )
}
