import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup.tsx'
import '../styles/index.css'
import '@mantine/core/styles.css'

import { MantineProvider } from '@mantine/core'
import { UserProvider } from '../content/contexts/UserContext.tsx'

ReactDOM.createRoot(document.getElementById('extension-root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <UserProvider>
        <Popup />
      </UserProvider>
    </MantineProvider>
  </React.StrictMode>,
)
