import { Offer, OfferToBeFormatted } from '../../types'
import { formatOffers } from '../firebase/firebaseFunctions'

export async function formatOffersInWorker(email: string, offers: OfferToBeFormatted[]): Promise<Offer[]> {
  try {
    const result = await formatOffers({ email, offers })
    const formattedOffers = result.data as Offer[]
    return formattedOffers
  } catch (error) {
    console.error('Error in formatOffersInWorker:', error)
    throw error
  }
}
