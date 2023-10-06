import { ISA_JOB_BOARD_URL } from '../utils/constants'

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (!sender.tab || sender.tab.url !== ISA_JOB_BOARD_URL) return

  if (!request.jobOffers) return

  console.log('Saving job offers in local storage of the extension', request.jobOffers)

  chrome.storage.local.set({ jobOffers: request.jobOffers }).then(() => {
    console.log('Saved!')
  })
})
