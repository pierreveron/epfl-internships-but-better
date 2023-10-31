async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

async function sendMessageToActiveTab<T = unknown>(message: T) {
  const tab = await getCurrentTab()
  if (!tab || !tab.id) return
  return chrome.tabs.sendMessage(tab.id, message)
}

async function goToPageOrOpenNewTab(url: string) {
  const tabs = await chrome.tabs.query({ currentWindow: true })

  const tabId = tabs.find((tab) => tab.url === url)?.id

  if (tabId) {
    return await chrome.tabs.update(tabId, { active: true })
  }

  return await chrome.tabs.create({ url })
}

export { getCurrentTab, sendMessageToActiveTab, goToPageOrOpenNewTab }
