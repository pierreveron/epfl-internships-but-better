chrome.storage.local.get('jobOffers', ({ jobOffers }) => {
  if (jobOffers) {
    const lastUpdated = JSON.parse(localStorage.getItem('offersWithLocationToBeFormatted') || '{}').lastUpdated

    if (lastUpdated !== jobOffers.lastUpdated) {
      localStorage.setItem('offersWithLocationToBeFormatted', JSON.stringify(jobOffers))
      window.dispatchEvent(new Event('jobOffersUpdated'))
    }
  }
})

const registerButton = document.querySelector('a[id="register-button"]')

// Add click listener to register button
registerButton?.addEventListener('click', () => {
  console.log('registerButton clicked')

  chrome.runtime.sendMessage({ type: 'register', offerId: registerButton.getAttribute('data-offer-id') })
})
