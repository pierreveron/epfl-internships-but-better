import { Location, Offer, OfferToBeFormatted } from '../../types'
import { cleanData } from '../../utils/firebase'

const handleCleanData = async (
  email: string,
  locations: string[],
  salaries: string[],
): Promise<{ locations: { [key: string]: Location[] }; salaries: { [key: string]: string } }> => {
  try {
    const result = await cleanData({ email, locations, salaries })
    const cleanedData = result.data as { locations: { [key: string]: Location[] }; salaries: { [key: string]: string } }

    // Use cleanedData.locations and cleanedData.salaries as needed
    console.log('Cleaned locations:', cleanedData.locations)
    console.log('Cleaned salaries:', cleanedData.salaries)

    // Update your UI or state with the cleaned data
    return cleanedData
  } catch (error) {
    console.error('Error cleaning data:', error)
    throw error
  }
}

export async function formatOffers(email: string, offers: OfferToBeFormatted[]): Promise<Offer[]> {
  const salaries = offers.map((offer) => offer.salary)
  const locations = offers.map((offer) => offer.location)

  const { locations: locationsMap, salaries: salariesMap } = await handleCleanData(email, locations, salaries)

  const formattedOffers = offers.map((offer) => ({
    ...offer,
    salary: salariesMap ? salariesMap[offer.salary] : offer.salary,
    location: locationsMap ? locationsMap[offer.location] : [{ city: offer.location, country: null }],
  }))
  return formattedOffers
}
