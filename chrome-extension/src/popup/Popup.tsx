import React, { useState, useEffect } from 'react'

export default function Popup() {
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    // Load the API key from storage when the component mounts
    chrome.storage.sync.get(['apiKey'], (result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey)
      }
    })
  }, [])

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
  }

  const saveApiKey = () => {
    chrome.storage.sync.set({ apiKey }, () => {
      console.log('API key saved')
    })
  }

  return (
    <div className="tw-space-y-4 tw-p-4">
      <h1 className="tw-text-2xl tw-whitespace-nowrap">
        <span className="tw-text-[red]">EPFL</span> internships but better
      </h1>
      <p className="tw-text-sm tw-text-gray-500 tw-text-left">
        This extension enhances the IS-Academia job board experience. Open the IS-Academia job board to use the enhanced
        features.
      </p>
      <div className="tw-space-y-2">
        <label htmlFor="apiKey" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          API Key
        </label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-red-500 focus:tw-ring-red-500 tw-sm:text-sm"
          placeholder="Enter your API key"
        />
        <button
          onClick={saveApiKey}
          className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-shadow-sm tw-text-white tw-bg-red-600 hover:tw-bg-red-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-red-500"
        >
          Save API Key
        </button>
      </div>
    </div>
  )
}
