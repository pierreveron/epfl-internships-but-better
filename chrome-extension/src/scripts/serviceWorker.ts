import { getCurrentTab } from '../utils/chrome-helpers'
import { ISA_JOB_BOARD_URL, NEW_JOB_BOARD_URL } from '../utils/constants'
import { scrapeJobs } from '../utils/scraping'
import { OfferToBeFormatted } from '../../../types'

async function pollTabUntilNot(tabId: number, status: string) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const tab = await chrome.tabs.get(tabId)

    if (!tab || !tab.id) {
      console.error('No tab found')
      return false
    }

    console.log('tab', tab)

    if (tab.status !== status) {
      return true
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

async function goToPage(type: string, offerId: string) {
  const tab = await getCurrentTab()

  if (!tab || !tab.id) {
    console.error('No tab found')
    return
  }

  if (!(await pollTabUntilNot(tab.id, 'loading'))) {
    console.error('An error occurred while polling tab')
    return
  }

  await chrome.tabs.sendMessage(tab.id, { type, offerId })
}

async function goToRegisterPage(offerId: string) {
  await goToPage('register', offerId)
}

async function goToViewPage(offerId: string) {
  await goToPage('view', offerId)
}

chrome.runtime.onMessageExternal.addListener(function (request, _, sendResponse) {
  if (request.message === 'version') {
    sendResponse({ version: chrome.runtime.getManifest().version })
  }
})

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type == 'register') {
    goToRegisterPage(request.offerId)
  }

  if (request.type == 'view') {
    goToViewPage(request.offerId)
  }

  if (request.message !== 'init') return

  let jobOffers: OfferToBeFormatted[] = []

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
