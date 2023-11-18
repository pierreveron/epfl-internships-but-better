async function navigateToView(offerId) {
  // eslint-disable-next-line no-undef
  if (!prtl && !prtl.synchronize) {
    return false
  }

  await waitLoad()

  // eslint-disable-next-line no-undef
  prtl.synchronize('ww_i_stageview=' + offerId)
  return true
}

async function navigateToRegister(offerId) {
  if (await navigateToView(offerId)) {
    // eslint-disable-next-line no-undef
    prtl.synchronize('ww_i_stageinscr=' + offerId)
    return true
  }
  return false
}

async function waitLoad() {
  var i = 0

  while (i < 10) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (document.querySelectorAll('tr[id]').length !== 0) {
      break
    }
    i++
  }
}

if (document.querySelector('script#navigateToRegister')) {
  const offerId = document.querySelector('script#navigateToRegister').textContent
  navigateToRegister(offerId)
} else if (document.querySelector('script#navigateToView')) {
  const offerId = document.querySelector('script#navigateToView').textContent
  navigateToView(offerId)
}
