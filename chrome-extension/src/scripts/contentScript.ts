chrome.storage.local.get('jobOffers', (res) => {
  if (res.jobOffers) {
    localStorage.setItem('jobOffers', JSON.stringify(res.jobOffers))
    window.dispatchEvent(new Event('jobOffersUpdated'))
  }
})
