import { DisplayMode, JobOffers, UserData } from './types'

// Generic helper functions
const getStorageData = <T>(key: string, defaultValue: T): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? defaultValue)
    })
  })
}

const setStorageData = <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve)
  })
}

const resetStorageData = (key: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, resolve)
  })
}

// Higher-order function to create getter, setter and resetter
const createStorageHelpers = <T>(key: string, defaultValue: T) => {
  return {
    get: (): Promise<T> => getStorageData(key, defaultValue),
    set: (value: T): Promise<void> => setStorageData(key, value),
    reset: (): Promise<void> => resetStorageData(key),
  }
}

export const jobOffersFromLocalStorage = createStorageHelpers<JobOffers>('jobOffers', {
  offers: [],
  lastUpdated: Date.now(),
})

export const hiddenOffersFromLocalStorage = createStorageHelpers<string[]>('hidden-offers', [])

export const favoriteOffersFromLocalStorage = createStorageHelpers<string[]>('favorite-offers', [])

export const userDataFromLocalStorage = createStorageHelpers<
  UserData & {
    timestamp: number
  }
>('userData', {
  hasReferredSomeone: false,
  referredAt: null,
  referralCode: '',
  timestamp: 0,
})

export const displayModeFromLocalStorage = createStorageHelpers<DisplayMode>('displayMode', 'list')

export const isExtensionEnabledFromLocalStorage = createStorageHelpers<boolean>('isExtensionEnabled', true)
