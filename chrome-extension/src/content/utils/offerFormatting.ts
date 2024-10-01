import { Offer, OfferToBeFormatted } from '../../types'

export async function formatOffers(email: string, offers: OfferToBeFormatted[]): Promise<Offer[]> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'formatOffers', email, offers }, (response) => {
      console.log('Response from formatOffers message:', response)
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(response)
      }
    })
  })
}
