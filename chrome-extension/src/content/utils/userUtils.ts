export const incrementFormattingCountInStorage = async (): Promise<number | undefined> => {
  const result = await chrome.storage.local.get('userData')
  const userData = result.userData
  if (userData) {
    userData.formattingCount = userData.formattingCount + 1
    await chrome.storage.local.set({ userData })
    return userData.formattingCount
  }
}

// const getUserDataFromStorage = async (): Promise<{
//   isPremium: boolean
//   formattingCount: number
//   timestamp: number
// } | null> => {
//   const result = await chrome.storage.local.get('userData')
//   return result.userData || null
// }

export const resetUserData = async () => {
  await chrome.storage.local.remove('userData')
  console.log('User data reset')
}
