import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('extension-root')!).render(
  <React.StrictMode>
    <div className="tw-max-w-7xl tw-p-8 tw-text-center tw-min-w-fit">Test</div>
    <App />
  </React.StrictMode>,
)
