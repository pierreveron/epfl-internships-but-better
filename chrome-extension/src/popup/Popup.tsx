import { getCurrentTab, sendMessageToActiveTab, goToPageOrOpenNewTab } from '../utils/chrome-helpers'
import { ISA_JOB_BOARD_URL, NEW_JOB_BOARD_URL } from '../utils/constants'

export default function Popup() {
  return (
    <div className="tw-space-y-8">
      <h1 className="tw-text-2xl tw-whitespace-nowrap">
        <span className="tw-text-[red]">EPFL</span> internships but better
      </h1>

      <div className="tw-flex tw-flex-col tw-gap-y-4">
        <button
          className="tw-rounded-md tw-bg-[red] tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-[red] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[red]"
          onClick={() => goToPageOrOpenNewTab(ISA_JOB_BOARD_URL)}
        >
          1.Navigate to ISA
        </button>

        <button
          className="tw-rounded-md tw-bg-[red] tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-[red] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[red]"
          onClick={async () => {
            const tab = await getCurrentTab()

            if (!tab || !tab.id) return

            if (tab.url !== ISA_JOB_BOARD_URL) {
              // console.log('not the right page')
              return
            }

            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content/index.js'],
            })
            chrome.scripting.insertCSS({
              target: { tabId: tab.id },
              files: ['content/index.css'],
            })

            window.close()
          }}
        >
          2.Execute script
        </button>

        <button
          className="tw-rounded-md tw-bg-[red] tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-[red] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[red]"
          onClick={() => goToPageOrOpenNewTab(NEW_JOB_BOARD_URL)}
        >
          3.Navigate to new website
        </button>

        <button
          className="tw-rounded-md tw-bg-[red] tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-[red] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[red]"
          onClick={async () => {
            const tab = await getCurrentTab()

            if (!tab || !tab.id) return

            if (tab.url !== NEW_JOB_BOARD_URL) return

            const jobOffers = await chrome.storage.local.get('jobOffers').then((res) => res.jobOffers)

            if (!jobOffers) return

            sendMessageToActiveTab({ jobOffers })
          }}
        >
          4.Inject data into new website
        </button>
      </div>
    </div>
  )
}
