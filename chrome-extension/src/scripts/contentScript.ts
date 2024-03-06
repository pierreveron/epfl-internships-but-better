chrome.storage.local.get('jobOffers', ({ jobOffers }) => {
  if (jobOffers) {
    const lastUpdated = JSON.parse(localStorage.getItem('offersToBeFormatted') || '{}').lastUpdated

    if (lastUpdated < jobOffers.lastUpdated) {
      localStorage.removeItem('jobOffers')
      localStorage.setItem('offersToBeFormatted', JSON.stringify(jobOffers))
      window.dispatchEvent(new Event('jobOffersUpdated'))
    }
  }
})

const registerButton = document.querySelector('a[id="register-button"]')
const viewButton = document.querySelector('a[id="view-button"]')

// Add click listener to register button
registerButton?.addEventListener('click', () => {
  console.log('registerButton clicked')

  chrome.runtime.sendMessage({ type: 'register', offerId: registerButton.getAttribute('data-offer-id') })
})

// Add click listener to view button
viewButton?.addEventListener('click', () => {
  console.log('viewButton clicked')

  chrome.runtime.sendMessage({ type: 'view', offerId: viewButton.getAttribute('data-offer-id') })
})
