// https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-using-a-content-script
chrome.runtime.onMessage.addListener(async function (request) {
  const createScript = (id: string) => {
    const s = document.createElement('script')
    s.textContent = request.offerId
    s.src = chrome.runtime.getURL('src/scripts/navigateToOffer.js')
    s.id = id
    s.onload = function () {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.remove()
    }
    // see also "Dynamic values in the injected code" section in this answer
    ;(document.head || document.documentElement).appendChild(s)
  }

  if (request.type === 'register' && request.offerId) {
    createScript('navigateToRegister')
  }

  if (request.type === 'view' && request.offerId) {
    createScript('navigateToView')
  }
})
