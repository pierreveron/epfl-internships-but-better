chrome.storage.local.get('jobOffers', ({ jobOffers }) => {
  if (jobOffers) {
    const lastUpdated = JSON.parse(localStorage.getItem('offersWithLocationToBeFormatted') || '{}').lastUpdated

    if (lastUpdated !== jobOffers.lastUpdated) {
      localStorage.setItem('offersWithLocationToBeFormatted', JSON.stringify(jobOffers))
      window.dispatchEvent(new Event('jobOffersUpdated'))
    }
  }
})
