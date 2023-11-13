// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function navigateToOffer(offerId) {
  // eslint-disable-next-line no-undef
  if (!prtl && !prtl.synchronize) {
    return
  }

  var i = 0

  while (i < 10) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (document.querySelectorAll('tr[id]').length !== 0) {
      break
    }
    i++
  }

  // eslint-disable-next-line no-undef
  prtl.synchronize('ww_i_stageview=' + offerId)
  // eslint-disable-next-line no-undef
  prtl.synchronize('ww_i_stageinscr=' + offerId)
}

const offerId = document.querySelector('script#navigateToOffer').textContent

navigateToOffer(offerId)
