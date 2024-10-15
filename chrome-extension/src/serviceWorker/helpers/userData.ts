import { UserData } from '../../types'
import { getUserData } from '../firebase/firebaseFunctions'
import { userDataFromLocalStorage } from '../../localStorage'

export const fetchUserData = async (email: string): Promise<UserData> => {
  console.log('fetching user data from firestore')

  try {
    const response = await getUserData(email)
    const data = response.data as {
      hasReferredSomeone: boolean
      referredAt: number | null
      referralCode: string
    }

    const userData = {
      hasReferredSomeone: data.hasReferredSomeone,
      referredAt: data.referredAt,
      referralCode: data.referralCode,
    }

    // Save user data to Chrome extension storage
    await userDataFromLocalStorage.set({ ...userData, timestamp: Date.now() })

    return userData
  } catch (error) {
    console.error('Error getting user data:', error)
    const defaultUserData = {
      hasReferredSomeone: false,
      referredAt: null,
      referralCode: '',
    }

    // Save default user data to Chrome extension storage
    await userDataFromLocalStorage.set({ ...defaultUserData, timestamp: Date.now() })

    return defaultUserData
  }
}
