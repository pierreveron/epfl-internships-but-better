import { auth, signIn, signUp } from './firebase/firebaseAuth'
import { fetchUserData } from './helpers/userData'
import { formatOffersInWorker } from './helpers/offerFormatting'
import { User } from 'firebase/auth'
import { userDataFromLocalStorage } from '../localStorage'
import { Offer, UserWithData } from '../types'

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

let currentUser: UserWithData | null = null
let formattingPromise: Promise<Offer[]> | null = null

auth.onAuthStateChanged((user) => {
  console.log('auth.onAuthStateChanged', user)

  if (user) {
    getFullUser(user).then((fullUser) => {
      currentUser = fullUser
      sendUserUpdateMessages(fullUser)
    })
  } else {
    currentUser = null
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

async function getFullUser(user: User | null): Promise<UserWithData | null> {
  if (!user) return null

  try {
    const storedData = await fetchUserData(user.email!)

    return {
      ...user,
      ...storedData,
      hasFiltersUnlocked:
        storedData.hasReferredSomeone ||
        (storedData.referredAt !== null && storedData.referredAt < Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  } catch (error) {
    console.error('Error getting full user data:', error)
    return null
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received from:', sender, request)
  if (request.type === 'SIGN_UP') {
    signUp(request.referralCode)
      .then((user) => {
        if (user) {
          console.log('User signed up')
          getFullUser(user).then((fullUser) => {
            currentUser = fullUser
            sendUserUpdateMessages(fullUser)
          })
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
          getFullUser(user).then((fullUser) => {
            currentUser = fullUser
            sendUserUpdateMessages(fullUser)
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
        userDataFromLocalStorage.reset().then(() => console.log('User data reset on sign out'))
        console.log('User signed out')
      })
      .catch((error) => {
        console.error('Error signing out:', error)
        sendResponse({ error: 'Sign-out error' })
      })
    return true // Indicates that the response is sent asynchronously
  }

  if (request.type === 'GET_CURRENT_USER') {
    console.log('Getting current user:', currentUser)
    sendResponse({ user: currentUser })
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
