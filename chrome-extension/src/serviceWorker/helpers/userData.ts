import { UserData } from '../../types'
import { getUserData } from '../firebase/firebaseFunctions'
import { userDataFromLocalStorage } from '../../localStorage'

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
    await userDataFromLocalStorage.set({ ...userData, timestamp: Date.now() })

    return userData
  } catch (error) {
    console.error('Error getting user data:', error)
    const defaultUserData = { isPremium: false, formattingCount: 0 }

    // Save default user data to Chrome extension storage
    await userDataFromLocalStorage.set({ ...defaultUserData, timestamp: Date.now() })

    return defaultUserData
  }
}
