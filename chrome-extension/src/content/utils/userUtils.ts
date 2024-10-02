import { userDataFromLocalStorage } from '../../localStorage'

export const incrementFormattingCountInStorage = async (): Promise<number | undefined> => {
  const userData = await userDataFromLocalStorage.get()
  userData.formattingCount = userData.formattingCount + 1
  await userDataFromLocalStorage.set({ ...userData, timestamp: Date.now() })
  return userData.formattingCount
}
