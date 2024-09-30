import { getUserData } from './firebase'

export const fetchUserData = async (email: string) => {
  try {
    const response = await getUserData(email)
    const data = response.data as { has_payment: boolean; formatting_count: number }
    return {
      isPremium: data.has_payment,
      formattingCount: data.formatting_count,
    }
  } catch (error) {
    console.error('Error getting user data:', error)
    return { isPremium: false, formattingCount: 0 }
  }
}
