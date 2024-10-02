/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from 'react'
import styles from '../styles/index.css?inline'
import mantineStyles from '@mantine/core/styles.css?inline'
import mantineDatatableStyles from 'mantine-datatable/styles.css?inline'
import { MantineProvider, createTheme, AppShell } from '@mantine/core'
// import { useAsideNavigation } from './utils/hooks'
import ActionBar from './components/ActionBar'
// import Table from './components/Table'
import OfferDescription from './components/OfferDescription'
// import BackwardStepIcon from './components/icons/BackwardStepIcon'
// import ForwardStepIcon from './components/icons/ForwardStepIcon'
// import MaximizeIcon from './components/icons/MaximizeIcon'
// import MinimizeIcon from './components/icons/MinimizeIcon'
// import XMarkIcon from './components/icons/XMarkIcon'
// import classNames from 'classnames'
import List from './components/List'
import { DataProvider } from './contexts/DataContext'
import { AsideProvider } from './contexts/AsideContext'
import { OfferActionsProvider } from './contexts/OfferActionsContext'
import { FilterProvider } from './contexts/FilterContext'
import { SortProvider } from './contexts/SortContext'
import { PaginationProvider } from './contexts/PaginationContext'
import { UserProvider } from './contexts/UserContext'
import Table from './components/Table'
import { useData } from './hooks/useData'
import { DisplayProvider } from './providers/DisplayProvider'
import { useDisplay } from './hooks/useDisplay'

function AppContent() {
  const { displayMode } = useDisplay()
  const { isLoading, newOffersCount } = useData()

  if (isLoading) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-full">
        <div className="tw-flex tw-flex-col tw-items-center">
          <div className="loader"></div>
          {newOffersCount > 0 ? (
            <p className="tw-mt-4 tw-text-gray-700">
              Found <span className="tw-font-semibold">{newOffersCount}</span> new offer
              {newOffersCount !== 1 ? 's' : ''}. Processing...
            </p>
          ) : (
            <p className="tw-mt-4 tw-text-gray-700">Looking for new offers...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppShell
      aside={{
        // width: {
        //   md: isAsideMaximized ? '100%' : 550,
        //   lg: asideOffer !== null ? (isAsideMaximized ? '100%' : 'max(40%, 550px)') : 0,
        // },
        width: '100%',
        breakpoint: 'md',
        collapsed: { mobile: false, desktop: false },
      }}
      padding="xl"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="tw-px-4 tw-py-4">
        <ActionBar />
      </div>
      <main className="tw-flex tw-flex-row tw-justify-between tw-w-full tw-flex-1 tw-overflow-hidden tw-border-t tw-border-gray-200">
        {displayMode === 'table' ? <Table /> : <List />}
        <OfferDescription />
      </main>
    </AppShell>
  )
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const style = document.createElement('style')
      style.textContent = styles + mantineStyles + mantineDatatableStyles
      containerRef.current.getRootNode().appendChild(style)
    }
  }, [])

  const theme = createTheme({
    primaryColor: 'red',
    components: {
      Select: {
        defaultProps: {
          comboboxProps: { withinPortal: false },
        },
      },
      Popover: {
        defaultProps: {
          withinPortal: false,
        },
      },
    },
  })

  return (
    <MantineProvider
      theme={theme}
      getRootElement={() => containerRef.current!}
      cssVariablesSelector="#extension-main-container"
    >
      <UserProvider>
        <DisplayProvider>
          <DataProvider>
            <AsideProvider>
              <OfferActionsProvider>
                <FilterProvider>
                  <SortProvider>
                    <PaginationProvider>
                      <div
                        ref={containerRef}
                        id="extension-main-container"
                        className="tw-bg-white tw-text-sm tw-font-sans tw-h-full tw-flex tw-flex-col"
                      >
                        <AppContent />
                      </div>
                    </PaginationProvider>
                  </SortProvider>
                </FilterProvider>
              </OfferActionsProvider>
            </AsideProvider>
          </DataProvider>
        </DisplayProvider>
      </UserProvider>
    </MantineProvider>
  )
}
