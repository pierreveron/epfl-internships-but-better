import { getCurrentTab } from '../utils/chrome-helpers'

export default function Popup() {
  return (
    <>
      <h1 className="tw-text-4xl">EPFL internships but better</h1>
      <button
        onClick={async () => {
          const tab = await getCurrentTab()

          if (!tab || !tab.id) return

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/index.js'],
          })
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content/index.css'],
          })
        }}
      >
        Execute script
      </button>
    </>
  )
}
