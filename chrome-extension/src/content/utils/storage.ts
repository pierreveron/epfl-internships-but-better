// Helper function to get data from chrome.storage.local
export const getStorageData = <T>(key: string, defaultValue: T): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? defaultValue)
    })
  })
}

// Helper function to set data in chrome.storage.local
export const setStorageData = <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve)
  })
}
