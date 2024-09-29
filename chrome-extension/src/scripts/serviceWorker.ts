import { signIn, auth } from '../firebase'
import { getPaymentStatus } from '../utils/firebase'
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
  let isPremium = false
  if (user) {
    getPaymentStatus(user.email)
      .then((response) => {
        const data = response.data as { has_payment: boolean }
        isPremium = data.has_payment

        currentUser = { ...user, isPremium, formattingCount: 0 }

        // Send message to content script
        chrome.tabs.query({}, function (tabs) {
          const tab = tabs.find((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
          if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'AUTH_STATE_CHANGED', user: currentUser }).catch((error) => {
              console.log(`Error sending message to tab ${tab.id}:`, error)
            })
          }
        })
      })
      .catch((error) => {
        console.error('Error getting payment status:', error)
        currentUser = { ...user, isPremium: false, formattingCount: 0 }
      })
  } else {
    currentUser = null
    // Send message to content script
    chrome.tabs.query({}, function (tabs) {
      const tab = tabs.find((tab) => tab.url?.startsWith('https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm'))
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'AUTH_STATE_CHANGED', user: currentUser }).catch((error) => {
          console.log(`Error sending message to tab ${tab.id}:`, error)
        })
      }
    })
  }
})

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
