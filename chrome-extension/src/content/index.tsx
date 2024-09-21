import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../styles/index.css'
import '../styles/loading-dots.css'

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
      const shadowRoot = root.attachShadow({ mode: 'closed' })

      // Store the original element
      const originalElement = targetElement.cloneNode(true)

      // Replace the target element with our root element
      targetElement.parentNode?.replaceChild(root, targetElement)

      try {
        ReactDOM.createRoot(shadowRoot).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>,
        )
      } catch (error) {
        console.error('Error rendering React app:', error)
        // Restore the original element
        root.parentNode?.replaceChild(originalElement, root)
        // Show an alert with the error message
        showErrorAlert()
      }
    }
  })
}

function showErrorAlert() {
  const errorMessage = `Oups... 🙇‍♂️
Something went wrong while loading the data.
Please try again (we never know 🤷‍♂️) & contact Pierre Véron on Linkedin (https://www.linkedin.com/in/pierre-veron/) or by email (pierre.veron@epfl.ch).`

  alert(errorMessage)
}

injectReactApp()
