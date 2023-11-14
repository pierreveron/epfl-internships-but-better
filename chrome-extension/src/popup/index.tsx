import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup.tsx'
import '../styles/index.css'
import '../styles/loading-dots.css'

ReactDOM.createRoot(document.getElementById('extension-root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)
