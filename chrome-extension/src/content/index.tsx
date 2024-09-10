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

// Function to inject our React app
function injectReactApp() {
  checkForElement().then((targetElement) => {
    console.log('injectReactApp', targetElement)
    console.log('injectReactApp', document.querySelector('.blocinfobody'))
    if (targetElement) {
      const root = document.createElement('div')
      root.id = 'extension-content-root'

      // Create a shadow root
      const shadowRoot = root.attachShadow({ mode: 'closed' })

      // Replace the target element with our root element
      targetElement.parentNode?.replaceChild(root, targetElement)

      ReactDOM.createRoot(shadowRoot).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      )
    }
  })
}

console.log('injectReactApp2')

injectReactApp()
