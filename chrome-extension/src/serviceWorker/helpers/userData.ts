import { Offer, UserData } from '../../types'
import { getUserData } from '../firebase/firebaseFunctions'

export const incrementFormattingCountInStorage = async (): Promise<number | undefined> => {
  const result = await chrome.storage.local.get('userData')
  const userData = result.userData
  if (userData) {
    userData.formattingCount = userData.formattingCount + 1
    await chrome.storage.local.set({ userData })
    return userData.formattingCount
  }
}

export const storeOffersInLocalStorage = (offers: Offer[]) => {
  chrome.storage.local.set({
    jobOffers: {
      offers: offers,
      lastUpdated: Date.now(),
    },
  })
}

export const getUserDataFromStorage = async (): Promise<{
  isPremium: boolean
  formattingCount: number
  timestamp: number
} | null> => {
  const result = await chrome.storage.local.get('userData')
  return result.userData || null
}

export const resetUserData = async () => {
  await chrome.storage.local.remove('userData')
  console.log('User data reset')
}

export const fetchUserData = async (email: string): Promise<UserData> => {
  console.log('fetching user data')

  try {
    console.log('fetching user data from firestore')

    const response = await getUserData(email)
    const data = response.data as { has_payment: boolean; formatting_count: number }
    const userData = {
      isPremium: data.has_payment,
      formattingCount: data.formatting_count,
    }

    // Save user data to Chrome extension storage
    await chrome.storage.local.set({ userData: { ...userData, timestamp: Date.now() } })

    return userData
  } catch (error) {
    console.error('Error getting user data:', error)
    const defaultUserData = { isPremium: false, formattingCount: 0 }

    // Save default user data to Chrome extension storage
    await chrome.storage.local.set({ userData: defaultUserData })

    return defaultUserData
  }
}
