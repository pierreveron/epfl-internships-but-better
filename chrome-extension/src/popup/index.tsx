import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup.tsx'
import '../styles/index.css'

ReactDOM.createRoot(document.getElementById('extension-root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)
