chrome.runtime.onMessage.addListener((request) => {
  if (request.jobOffers) localStorage.setItem('jobOffers', request.jobOffers)
})
