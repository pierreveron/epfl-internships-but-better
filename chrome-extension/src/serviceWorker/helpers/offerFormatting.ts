import { Offer, OfferToBeFormatted } from '../../types'
import { cleanData } from '../firebase/firebaseFunctions'
import { Location } from '../../types'

export async function formatOffersInWorker(email: string, offers: OfferToBeFormatted[]): Promise<Offer[]> {
  const salaries = offers.map((offer) => offer.salary)
  const locations = offers.map((offer) => offer.location)

  try {
    const result = await cleanData({ email, locations, salaries })
    const { locations: locationsMap, salaries: salariesMap } = result.data as {
      locations: Record<string, Location[]>
      salaries: Record<string, string>
    }

    const formattedOffers = offers.map((offer) => ({
      ...offer,
      salary: salariesMap ? salariesMap[offer.salary] : offer.salary,
      location: locationsMap ? locationsMap[offer.location] : [{ city: offer.location, country: null }],
    }))
    return formattedOffers
  } catch (error) {
    console.error('Error in formatOffersInWorker:', error)
    throw error
  }
}
