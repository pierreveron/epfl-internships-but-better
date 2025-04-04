import { auth, signIn, signUp } from './firebase/firebaseAuth'
import { formatOffersInWorker } from './helpers/offerFormatting'
import { User } from 'firebase/auth'
import { Offer } from '../types'

// const constants = {
//   consoleLog: import.meta.env.VITE_CONSOLE_LOG,
// }

// // Override console.log
// if (constants.consoleLog !== 'true') {
//   console.log = () => {}
// } else {
//   const originalConsoleLog = console.log
//   console.log = (...args) => {
//     originalConsoleLog('[DEV]', ...args)
//   }
// }

const originalConsoleLog = console.log
console.log = (...args) => {
  originalConsoleLog('[EPFL-INTERNSHIPS-BUT-BETTER]', ...args)
}
const originalConsoleError = console.error
console.error = (...args) => {
  originalConsoleError('[EPFL-INTERNSHIPS-BUT-BETTER]', ...args)
}

let formattingPromise: Promise<Offer[]> | null = null

async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['currentUser'], (result) => {
      resolve(result.currentUser || null)
    })
  })
}

async function persistCurrentUser(user: User | null) {
  await chrome.storage.local.set({ currentUser: user })
}

auth.onAuthStateChanged((user) => {
  console.log('auth.onAuthStateChanged', user)

  if (user) {
    persistCurrentUser(user)
    sendUserUpdateMessages(user)
  } else {
    persistCurrentUser(null)
    sendUserUpdateMessages(null)
    // Remove all storage if user is not logged in
    chrome.storage.local.clear(() => {
      console.log('All chrome.storage.local data cleared when user changes')
    })
  }
})

function sendUserUpdateMessages(user: User | null) {
  chrome.runtime
    .sendMessage({ type: 'AUTH_STATE_CHANGED', user })
    .then(() => console.log('AUTH_STATE_CHANGED sent successfully to popup'))
    .catch((error) => console.log('Error sending AUTH_STATE_CHANGED to popup:', error))

  // Send message to content script
  chrome.tabs.query({}, function (tabs) {
    console.log('tabs', tabs)
    tabs = tabs.filter((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
    tabs.forEach((tab) => {
      if (tab?.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: 'AUTH_STATE_CHANGED', user })
          .then(() => console.log('AUTH_STATE_CHANGED sent successfully to content script'))
          .catch((error) => console.log(`Error sending AUTH_STATE_CHANGED to content script in tab ${tab.id}:`, error))
      }
    })
  })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received from:', sender, request)
  if (request.type === 'SIGN_UP') {
    signUp()
      .then((user) => {
        if (user) {
          console.log('User signed up')
          persistCurrentUser(user)
          sendUserUpdateMessages(user)
          sendResponse({ success: true })
        } else {
          sendResponse({ error: 'Sign-up failed' })
        }
      })
      .catch((error) => {
        console.error('Error signing up:', error)
        sendResponse({ error: 'Sign-up error: ' + error.message })
      })
    return true // Indicates that the response is sent asynchronously
  }

  if (request.type === 'SIGN_IN') {
    signIn()
      .then((user) => {
        if (user) {
          console.log('User signed in')
          persistCurrentUser(user)
          sendUserUpdateMessages(user)
          sendResponse({ success: true })
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
        console.log('User signed out')
        sendResponse({ success: true })
      })
      .catch((error) => {
        console.error('Error signing out:', error)
        sendResponse({ error: 'Sign-out error' })
      })
    return true // Indicates that the response is sent asynchronously
  }

  if (request.type === 'GET_CURRENT_USER') {
    getCurrentUser().then((user) => {
      console.log('Getting current user from storage:', user)
      sendResponse({ user })
    })
    return true // Indicates async response
  }

  if (request.action === 'formatOffers') {
    const { email, offers } = request

    // If formatting is already in progress, wait for it to finish
    if (formattingPromise) {
      formattingPromise
        .then((formattedOffers) => {
          sendResponse(formattedOffers)
        })
        .catch((error) => {
          console.error('Error while waiting for formatting:', error)
          sendResponse({ error: 'Offer formatting error' })
        })
    } else {
      // Start a new formatting operation
      formattingPromise = formatOffersInWorker(email, offers)
        .catch((error) => {
          console.error('Error formatting offers:', error)
          throw error
        })
        .finally(() => {
          formattingPromise = null
        })

      formattingPromise
        .then((formattedOffers) => {
          sendResponse(formattedOffers)
        })
        .catch((error) => {
          console.error('Error while waiting for formatting:', error)
          sendResponse({ error: 'Offer formatting error' })
        })
    }

    return true // Indicates that the response is sent asynchronously
  }

  if (request.action === 'openPopup') {
    try {
      chrome.action.openPopup()
      sendResponse({ success: true })
    } catch (error) {
      console.error('Error opening popup:', error)
      sendResponse({ error: 'Failed to open popup' })
    }
    return true // Indicates that the response is sent asynchronously
  }
})
