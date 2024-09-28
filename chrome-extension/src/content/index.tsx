import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../styles/index.css'
import '../styles/loading-dots.css'
import ErrorBoundary from './components/ErrorBoundary'

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

      // Hide the target element
      targetElement.style.display = 'none'

      // Insert our root element after the target element
      targetElement.parentNode?.insertBefore(root, targetElement.nextSibling)

      try {
        ReactDOM.createRoot(shadowRoot).render(
          <React.StrictMode>
            <ErrorBoundary handleError={(error) => handleError(error, targetElement)}>
              <App />
            </ErrorBoundary>
          </React.StrictMode>,
        )
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
  if (response.user) {
    injectReactApp()
  }
})
