import { Location, Offer, OfferToBeFormatted } from '../../../../types'
import { API_URL } from './constants'

const controller = new AbortController()

export function abortFormatting() {
  controller.abort()
}

export function formatOffers(offers: OfferToBeFormatted[]): Promise<Offer[]> {
  const salaries = offers.map((offer) => offer.salary)
  const salariesMap = formatSalaries(salaries)

  const locations = offers.map((offer) => offer.location)
  const locationsMap = formatLocations(locations)

  return Promise.all([salariesMap, locationsMap]).then(([salariesMap, locationsMap]) => {
    const formattedOffers = offers.map((offer) => ({
      ...offer,
      salary: salariesMap ? salariesMap[offer.salary] : offer.salary,
      location: locationsMap ? locationsMap[offer.location] : [{ city: offer.location, country: null }],
    }))
    return formattedOffers
  })
}

function getApiKey(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['apiKey'], (result) => {
      if (result.apiKey) {
        resolve(result.apiKey)
      } else {
        reject(new Error('API key not found'))
      }
    })
  })
}

async function formatSalaries(salaries: string[]) {
  try {
    const apiKey = await getApiKey()
    const response = await fetch(`${API_URL}/clean-salaries`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(salaries),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok.')
    }

    const data: { salaries: { [key: string]: string } } = await response.json()
    console.log('Formatted salaries:', data)
    return data.salaries
  } catch (error) {
    console.error('Error formatting salaries:', error)
    throw error
  }
}

async function formatLocations(locations: string[]) {
  try {
    const apiKey = await getApiKey()
    const response = await fetch(`${API_URL}/clean-locations`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(locations),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok.')
    }

    const data: { locations: { [key: string]: Location[] } } = await response.json()
    console.log('Formatted locations:', data)
    return data.locations
  } catch (error) {
    console.error('Error formatting locations:', error)
    throw error
  }
}
