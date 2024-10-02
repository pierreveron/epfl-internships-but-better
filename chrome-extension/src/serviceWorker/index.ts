import { auth, signIn } from './firebase/firebaseAuth'
import { resetUserData } from '../content/utils/userUtils'
import { fetchUserData, storeOffersInLocalStorage } from './helpers/userData'
import { formatOffersInWorker } from './helpers/offerFormatting'
import { User } from 'firebase/auth'

const constants = {
  consoleLog: import.meta.env.VITE_CONSOLE_LOG,
}

// Override console.log
if (constants.consoleLog !== 'true') {
  console.log = () => {}
} else {
  const originalConsoleLog = console.log
  console.log = (...args) => {
    originalConsoleLog('[DEV]', ...args)
  }
}

let currentUser: User | null = null

auth.onAuthStateChanged((user) => {
  console.log('auth.onAuthStateChanged', user)

  currentUser = user

  sendUserUpdateMessages(user)

  if (!user) {
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
    const tab = tabs.find((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
    if (tab?.id) {
      chrome.tabs
        .sendMessage(tab.id, { type: 'AUTH_STATE_CHANGED', user })
        .then(() => console.log('AUTH_STATE_CHANGED sent successfully to content script'))
        .catch((error) => console.log(`Error sending AUTH_STATE_CHANGED to content script in tab ${tab.id}:`, error))
    }
  })
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'SIGN_IN') {
    signIn()
      .then((user) => {
        if (user) {
          console.log('User signed in')
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
        resetUserData().then(() => console.log('User data reset on sign out'))
        console.log('User signed out')
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

  if (request.action === 'formatOffers') {
    const { email, offers } = request
    formatOffersInWorker(email, offers)
      .then((formattedOffers) => {
        storeOffersInLocalStorage(formattedOffers)
        sendResponse(formattedOffers)
      })
      .catch((error) => {
        console.error('Error formatting offers:', error)
        sendResponse({ error: 'Offer formatting error' })
      })
    return true // Indicates that the response is sent asynchronously
  }

  if (request.type === 'FETCH_USER_DATA') {
    if (currentUser && currentUser.email) {
      fetchUserData(currentUser.email)
        .then((userData) => {
          sendResponse({ userData })
        })
        .catch((error) => {
          console.error('Error fetching user data:', error)
          sendResponse({ error: 'Failed to fetch user data' })
        })
    } else {
      sendResponse({ error: 'No current user' })
    }
    return true // Indicates that the response is sent asynchronously
  }
})
