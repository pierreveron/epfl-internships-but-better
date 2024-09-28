import { getCurrentTab } from '../utils/chrome-helpers'
import { ISA_JOB_BOARD_URL, NEW_JOB_BOARD_URL } from '../utils/constants'
import { scrapeJobs } from '../utils/scraping'
import { OfferToBeFormatted } from '../types'
import { signIn, auth } from '../firebase'
import { User } from 'firebase/auth'

let currentUser: User | null = null

auth.onAuthStateChanged((user) => {
  currentUser = user
  chrome.runtime.sendMessage({ type: 'AUTH_STATE_CHANGED', user }).catch((error) => {
    console.log('Error sending message to extension:', error)
  })
})

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

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'SIGN_IN') {
    signIn()
      .then((user) => {
        if (user) {
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs.find((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
            if (tab) {
              chrome.tabs.reload(tab.id!)
            }
          })
        } else {
          sendResponse({ error: 'Sign-in failed' })
        }
      })
      .catch((error) => {
        console.error('Error signing in:', error)
        sendResponse({ error: 'Sign-in error' })
      })
    return true // Indicates that the response is sent asynchronously
  }

  if (request.type === 'SIGN_OUT') {
    auth
      .signOut()
      .then(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const tab = tabs.find((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
          if (tab) {
            chrome.tabs.reload(tab.id!)
          }
        })
      })
      .catch((error) => {
        console.error('Error signing out:', error)
        sendResponse({ error: 'Sign-out error' })
      })
    return true // Indicates that the response is sent asynchronously
  }

  if (request.type === 'GET_CURRENT_USER') {
    sendResponse({ user: currentUser })
    return true
  }
})
