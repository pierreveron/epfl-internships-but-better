import { getCurrentTab } from '../utils/chrome-helpers'
import { ISA_JOB_BOARD_URL, NEW_JOB_BOARD_URL } from '../utils/constants'
import { scrapeJobs } from '../utils/scraping'
import { OfferWithLocationToBeFormatted } from '../utils/types'

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.message !== 'init') return

  let jobOffers: OfferWithLocationToBeFormatted[] = []

  const tab = await getCurrentTab()

  if (!tab || !tab.id || tab.url !== ISA_JOB_BOARD_URL) {
    console.error('The current tab is not the ISA job board')
    return
  }

  try {
    jobOffers = await scrapeJobs((offersCount, offersLoaded) => {
      chrome.runtime.sendMessage({
        offersCount,
        offersLoaded,
      })
    })
  } catch (error) {
    chrome.runtime.sendMessage({
      error,
    })
    return
  }

  if (!jobOffers) return

  await chrome.storage.local.set({
    jobOffers: {
      offers: jobOffers,
      lastUpdated: Date.now(),
    },
  })

  chrome.tabs.create({ url: NEW_JOB_BOARD_URL })
})
