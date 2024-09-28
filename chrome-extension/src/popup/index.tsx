import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup.tsx'
import '../styles/index.css'
import '@mantine/core/styles.css'

import { MantineProvider } from '@mantine/core'

ReactDOM.createRoot(document.getElementById('extension-root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <Popup />
    </MantineProvider>
  </React.StrictMode>,
)
