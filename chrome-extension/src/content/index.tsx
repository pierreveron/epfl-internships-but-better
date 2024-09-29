import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../styles/index.css'
import ErrorBoundary from './components/ErrorBoundary'

const constants = {
  consoleLog: import.meta.env.VITE_CONSOLE_LOG,
}

// Override console.log
if (constants.consoleLog !== 'true') {
  console.log = () => {}
} else {
  const originalConsoleLog = console.log
  console.log = (...args) => {
    originalConsoleLog('[DEV]', ...args)
  }
}

let isReactAppInjected = false

function checkForElement(): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const check = () => {
      const targetElement = document.getElementById('BB308197177_300')
      if (targetElement) {
        console.log('Target element found!')
        resolve(targetElement)
      } else {
        console.log('Element not found, checking again in 1 second...')
        setTimeout(check, 1000)
      }
    }
    check()
  })
}

function updateHeight(targetElement: HTMLElement, root: HTMLElement) {
  const windowHeight = window.innerHeight
  const targetRect = targetElement.getBoundingClientRect()
  const availableHeight = windowHeight - targetRect.top
  root.style.height = `${availableHeight}px`
}

// Function to inject our React app
function injectReactApp() {
  checkForElement().then((targetElement) => {
    if (targetElement) {
      const root = document.createElement('div')
      root.id = 'extension-content-root'

      updateHeight(targetElement, root)
      window.addEventListener('resize', () => updateHeight(targetElement, root))

      root.style.overflow = 'hidden'

      // Create a shadow root
      // Create a shadow root with 'open' mode
      // This allows external scripts to access the shadow DOM like Mantine
      const shadowRoot = root.attachShadow({ mode: 'open' })

      // Hide the target element only if the extension is disabled
      chrome.storage.local.get('isEnabled', (result) => {
        if (result.isEnabled === false) {
          switchElementsDisplay(targetElement, root)
        } else {
          switchElementsDisplay(root, targetElement)
        }
      })

      // Insert our root element after the target element
      targetElement.parentNode?.insertBefore(root, targetElement.nextSibling)

      try {
        isReactAppInjected = true
        ReactDOM.createRoot(shadowRoot).render(
          <React.StrictMode>
            <ErrorBoundary handleError={(error) => handleError(error, targetElement)}>
              <App />
            </ErrorBoundary>
          </React.StrictMode>,
        )
        console.log('React app injected')
      } catch (error) {
        handleError(error as Error, targetElement)
      }
    }
  })
}

function handleError(error: Error, targetElement: HTMLElement) {
  console.error('Error rendering React app:', error)
  // Show the original element
  targetElement.style.display = ''
  // Remove our injected root element
  const root = document.getElementById('extension-content-root')
  root?.remove()
  // Show an alert with the error message
  showErrorAlert()
}

function showErrorAlert() {
  const errorMessage = `Oups... 🙇‍♂️
Something went wrong while loading the data.
Please try again (we never know 🤷‍♂️) & contact Pierre Véron on Linkedin (https://www.linkedin.com/in/pierre-veron/) or by email (pierre.veron@epfl.ch).`

  alert(errorMessage)
}

chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' }, (response) => {
  console.log('GET_CURRENT_USER in content', response)
  if (response.user && !isReactAppInjected) {
    console.log('injecting React app on GET_CURRENT_USER')
    injectReactApp()
  }
})

chrome.runtime.onMessage.addListener((request) => {
  console.log('onMessage', request)
  if (request.type === 'AUTH_STATE_CHANGED') {
    console.log('AUTH_STATE_CHANGED in content', request.user)
    if (request.user && !isReactAppInjected) {
      console.log('injecting React app on AUTH_STATE_CHANGED')
      injectReactApp()
    }
  }
})

function switchElementsDisplay(activeElement: HTMLElement | null, disabledElement: HTMLElement | null) {
  if (activeElement) {
    activeElement.style.display = ''
  }
  if (disabledElement) {
    disabledElement.style.display = 'none'
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'CHANGE_STATE') {
    const isEnabled = request.state === 'ENABLED'
    const targetElement = document.getElementById('BB308197177_300')
    const root = document.getElementById('extension-content-root')

    if (isEnabled) {
      switchElementsDisplay(root, targetElement)
    } else {
      switchElementsDisplay(targetElement, root)
    }
  }
})
