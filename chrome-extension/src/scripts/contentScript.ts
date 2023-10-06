chrome.runtime.onMessage.addListener((request) => {
  if (request.jobOffers) localStorage.setItem('jobOffers', JSON.stringify(request.jobOffers))
})
