import { getCurrentTab } from '../utils/chrome-helpers'
import { ISA_JOB_BOARD_URL, API_URL, NEW_JOB_BOARD_URL } from '../utils/constants'
import { scrapeJobs } from '../utils/scraping'
import { Location, Offer, OfferWithLocationToBeFormatted } from '../utils/types'

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.message !== 'init') return

  let jobOffers: OfferWithLocationToBeFormatted[] = []

  const tab = await getCurrentTab()

  if (!tab || !tab.id || tab.url !== ISA_JOB_BOARD_URL) {
    console.error('The current tab is not the ISA job board')
    return
  }

  try {
    jobOffers = await scrapeJobs((offersLoaded) => {
      chrome.tabs.sendMessage(tab.id!, {
        offersLoaded,
      })

      chrome.runtime.sendMessage({
        offersLoaded,
      })
    })
  } catch (error) {
    console.error('Error:', error)

    chrome.runtime.sendMessage({
      error,
    })
    return
  }

  if (!jobOffers) return

  const locationsToBeFormatted = jobOffers.map((offer) => offer.location)
  console.log('Locations:', locationsToBeFormatted)
  const stringifiedLocations = JSON.stringify(locationsToBeFormatted)
  console.log('Stringified locations:', stringifiedLocations)

  console.log('Formatting the locations')

  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: stringifiedLocations,
  })
    .then((response) => response.json())
    .then((data: { locations: { [key: string]: Location[] } }) => {
      console.log('Formatted!:', data)
      const { locations } = data
      // Replace offers original location by new one

      const correctedJobOffers = jobOffers.map((offer) => ({
        ...offer,
        location: locations[offer.location],
      })) as Offer[]
      return correctedJobOffers
    })
    .then((jobOffers: Offer[]) => {
      console.log('Saving job offers in local storage of the extension', jobOffers)

      chrome.storage.local
        .set({
          jobOffers: {
            offers: jobOffers,
            lastUpdated: Date.now(),
          },
        })
        .then(() => {
          console.log('Saved!')
          chrome.tabs.create({ url: NEW_JOB_BOARD_URL })
        })
    })
    .catch((error) => {
      console.error('Error:', error)
    })
})
