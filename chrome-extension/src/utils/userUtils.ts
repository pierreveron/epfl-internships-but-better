import { getUserData } from './firebase'

const getUserDataFromStorage = async (): Promise<{
  isPremium: boolean
  formattingCount: number
  timestamp: number
} | null> => {
  const result = await chrome.storage.local.get('userData')
  return result.userData || null
}

export const resetUserData = async () => {
  await chrome.storage.local.remove('userData')
}

const MAX_CACHE_TIME = 1000 * 60 * 60 * 24 * 7 // 1 week

export const fetchUserData = async (
  email: string,
): Promise<{
  isPremium: boolean
  formattingCount: number
}> => {
  try {
    const userDataFromStorage = await getUserDataFromStorage()
    if (userDataFromStorage && Date.now() - userDataFromStorage.timestamp < MAX_CACHE_TIME) {
      return {
        isPremium: userDataFromStorage.isPremium,
        formattingCount: userDataFromStorage.formattingCount,
      }
    }

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
