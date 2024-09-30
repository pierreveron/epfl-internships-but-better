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
    if (typeof prtl !== 'undefined') {
      clearInterval(pollInterval)
      logger('prtl is defined, executing callback')
      callback()
    } else {
      logger('Waiting for prtl to be defined...')
    }
  }, 100)
}

window.addEventListener('message', function (event) {
  if (event.data.type === 'navigateToView') {
    pollForPrtl(() => navigateToView(event.data.offerId))
  } else if (event.data.type === 'navigateToRegister') {
    pollForPrtl(() => navigateToRegister(event.data.offerId))
  }
})

async function navigateToView(offerId) {
  logger('Navigating to view for offer:', offerId)

  // eslint-disable-next-line no-undef
  prtl.synchronize('ww_i_stageview=' + offerId)
}

async function navigateToRegister(offerId) {
  logger('Navigating to register for offer:', offerId)

  // eslint-disable-next-line no-undef
  prtl.synchronize('ww_i_stageinscr=' + offerId)
}
