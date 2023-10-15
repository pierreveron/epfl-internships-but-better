import { ISA_JOB_BOARD_URL } from '../utils/constants'
import { scrapeJobs } from '../utils/scraping'
import { Offer, Location, OfferWithLocationToBeFormatted } from '../utils/types'

chrome.runtime.onMessage.addListener(async function (request, sender) {
  if (!sender.tab || sender.tab.url !== ISA_JOB_BOARD_URL) return

  if (request.message !== 'init') return

  let jobOffers: OfferWithLocationToBeFormatted[] = []

  try {
    jobOffers = await scrapeJobs((offersLoaded) =>
      chrome.runtime.sendMessage({
        offersLoaded,
      }),
    )
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

  fetch('http://localhost:8000/clean-locations', {
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
        })
    })
    .catch((error) => {
      console.error('Error:', error)
    })
})
