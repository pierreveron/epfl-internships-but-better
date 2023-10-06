import { useEffect, useState } from 'react'
import { scrapeJobs } from '../utils/scraping'

export default function Content() {
  const [progessText, setProgressText] = useState('Scraping...')

  useEffect(() => {
    scrapeJobs((text) => setProgressText(text)).then((jobOffers) => {
      console.log('Job offers', jobOffers)
      /**
       * Job offers are send to the background script to be saved in the storage of the extension
       * @file chrome-extension/src/background/serviceWorker.ts
       */
      chrome.runtime.sendMessage({ jobOffers })
    })
  }, [])

  return (
    <div
      className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity tw-z-[1000]"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <p className="tw-text-4xl tw-text-white">{progessText}</p>
    </div>
  )
}
