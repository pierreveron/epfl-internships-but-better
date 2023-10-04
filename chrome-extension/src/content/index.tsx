import React from 'react'
import ReactDOM from 'react-dom/client'
import '..styles/index.css'
import Content from './Content'

const root = document.createElement('div')
root.id = 'extension-root'
document.body.appendChild(root)

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Content />
  </React.StrictMode>,
)
