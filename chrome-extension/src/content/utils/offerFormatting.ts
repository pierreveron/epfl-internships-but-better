import { Location, Offer, OfferToBeFormatted } from '../../types'
import { cleanSalaries, cleanLocations } from '../../utils/firebase'

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
async function formatSalaries(salaries: string[]) {
  try {
    const result = await cleanSalaries(salaries)
    console.log('result', result)
    const data = result.data as { salaries: { [key: string]: string } }

    console.log('Formatted salaries:', data)
    return data.salaries
  } catch (error) {
    console.error('Error formatting salaries:', error)
    throw error
  }
}

async function formatLocations(locations: string[]) {
  try {
    const result = await cleanLocations(locations)
    console.log('result', result)
    const data = result.data as { locations: { [key: string]: Location[] } }

    console.log('Formatted locations:', data)
    return data.locations
  } catch (error) {
    console.error('Error formatting locations:', error)
    throw error
  }
}
