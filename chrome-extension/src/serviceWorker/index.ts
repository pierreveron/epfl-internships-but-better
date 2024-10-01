import { auth, signIn } from './firebase/firebaseAuth'
import { resetUserData } from '../content/utils/userUtils'
import { fetchUserData } from './userUtils' // Make sure to create this function in userUtils.ts
import { UserWithPremium } from '../types'

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

let currentUser: UserWithPremium | null = null

auth.onAuthStateChanged((user) => {
  console.log('auth.onAuthStateChanged', user)

  if (user && user.email) {
    fetchUserData(user.email)
      .then((userPremiumStatus) => {
        currentUser = { ...user, ...userPremiumStatus }
        sendUserUpdateMessages(currentUser)
      })
      .catch((error) => {
        console.error('Error fetching user data:', error)
        currentUser = null
        sendUserUpdateMessages(null)
      })
  } else {
    currentUser = null
    sendUserUpdateMessages(null)
  }
})

function sendUserUpdateMessages(user: UserWithPremium | null) {
  chrome.runtime
    .sendMessage({ type: 'AUTH_STATE_CHANGED', user })
    .then(() => console.log('Message sent successfully to popup'))
    .catch((error) => console.log('Error sending message to popup:', error))

  // Send message to content script
  chrome.tabs.query({}, function (tabs) {
    console.log('tabs', tabs)
    const tab = tabs.find((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
    if (tab?.id) {
      chrome.tabs
        .sendMessage(tab.id, { type: 'AUTH_STATE_CHANGED', user })
        .then(() => console.log('Message sent successfully to content script'))
        .catch((error) => console.log(`Error sending message to content script in tab ${tab.id}:`, error))
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
})
