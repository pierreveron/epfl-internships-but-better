import { UserData } from '../../types'
import { getUserData } from '../firebase/firebaseFunctions'
import { userDataFromLocalStorage } from '../../localStorage'

export const fetchUserData = async (email: string): Promise<UserData> => {
  console.log('fetching user data from firestore')

  try {
    const response = await getUserData(email)
    const data = response.data as {
      has_payment: boolean
      formatting_count: number
      affiliate_code: string
      referral_completed: boolean
    }
    const userData = {
      isPremium: data.has_payment || data.referral_completed,
      formattingCount: data.formatting_count,
      affiliateCode: data.affiliate_code,
    }

    // Save user data to Chrome extension storage
    await userDataFromLocalStorage.set({ ...userData, timestamp: Date.now() })

    return userData
  } catch (error) {
    console.error('Error getting user data:', error)
    const defaultUserData = { isPremium: false, formattingCount: 0, affiliateCode: '' }

    // Save default user data to Chrome extension storage
    await userDataFromLocalStorage.set({ ...defaultUserData, timestamp: Date.now() })

    return defaultUserData
  }
}
