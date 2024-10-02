const constants = {
  consoleLog: false,
}

let logger = () => {}

if (constants.consoleLog) {
  const originalConsoleLog = console.log
  logger = (...args) => {
    originalConsoleLog('[DEV]', ...args)
  }
}

function pollForPrtl(callback) {
  const pollInterval = setInterval(() => {
    logger('prtl', typeof prtl)
    // eslint-disable-next-line no-undef
    logger('prtl.synchronize', typeof prtl?.synchronize)
    // eslint-disable-next-line no-undef
    if (typeof prtl !== 'undefined' && typeof prtl.synchronize === 'function') {
      clearInterval(pollInterval)
      logger('prtl is defined, executing callback')
      clearTimeout(timeoutId)
      callback()
    } else {
      logger('Waiting for prtl to be defined...')
    }
  }, 100)
  // Add a 2-minute timeout
  const timeoutId = setTimeout(() => {
    clearInterval(pollInterval)
    logger('Polling timed out after 10 seconds')
    // You might want to handle the timeout case, e.g., show an error message
  }, 10 * 1000) // 10 seconds in milliseconds
}

window.addEventListener('message', function (event) {
  // if (event.data.type.startsWith('navigateTo')) {
  //   logger('Received message:', event.data)
  // }

  logger('Received message:', event.data)
  logger('Received message type:', event.data.type, typeof event.data.type)

  if (event.data.type === 'navigateToView') {
    pollForPrtl(() => navigateToView(event.data.offerId))
  } else if (event.data.type === 'navigateToRegister') {
    pollForPrtl(() => navigateToRegister(event.data.offerId))
  }
})

async function navigateToView(offerId) {
  logger('Navigating to view for offer:', offerId)

  try {
    // eslint-disable-next-line no-undef
    prtl.synchronize('ww_i_stageview=' + offerId)
  } catch (e) {
    logger('Error navigating to view page:', e)
  }
}

async function navigateToRegister(offerId) {
  logger('Navigating to register for offer:', offerId)

  try {
    // eslint-disable-next-line no-undef
    prtl.synchronize('ww_i_stageinscr=' + offerId)
  } catch (e) {
    logger('Error navigating to register page:', e)
  }
}
