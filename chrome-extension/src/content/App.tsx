/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from 'react'
import styles from '../styles/index.css?inline'
import loadingDots from '../styles/loading-dots.css?inline'
import mantineStyles from '@mantine/core/styles.css?inline'
import mantineDatatableStyles from 'mantine-datatable/styles.css?inline'
import { MantineProvider, createTheme, AppShell } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import { useViewportSize } from '@mantine/hooks'
import { displayModeAtom, isAsideMaximizedAtom } from './atoms'
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
import { DataProvider } from './DataProvider'
import { AsideProvider } from './contexts/AsideContext'
import { OfferActionsProvider } from './contexts/OfferActionsContext'
import { useAside } from './hooks/useAside'
import { FilterProvider } from './contexts/FilterContext'
import { SortProvider } from './contexts/SortContext'
import { PaginationProvider } from './contexts/PaginationContext'
import Table from './components/Table'
import { useData } from '../utils/useData'

function AppContent() {
  const { offer: asideOffer } = useAside()
  const [isAsideMaximized, setIsAsideMaximized] = useAtom(isAsideMaximizedAtom)
  const displayMode = useAtomValue(displayModeAtom)
  const { isLoading } = useData()

  const { width } = useViewportSize()

  useEffect(() => {
    if (width <= 992 && isAsideMaximized) {
      setIsAsideMaximized(false)
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

  if (isLoading) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-full">
        <div className="tw-flex tw-flex-col tw-items-center">
          <div className="loader"></div>
        </div>
      </div>
    )
  }

  return (
    <AppShell
      aside={{
        width: {
          md: isAsideMaximized ? '100%' : 550,
          lg: asideOffer !== null ? (isAsideMaximized ? '100%' : 'max(40%, 550px)') : 0,
        },
        breakpoint: 'md',
        collapsed: { mobile: false, desktop: false },
      }}
      padding="xl"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="tw-px-4 tw-py-4">
        <ActionBar />
      </div>
      {/* Used the hack below to remove the padding when aside is closed and size is 0, otherwise the aside was still visible */}
      {/* <AppShell.Aside {...(isAsideOpen && !isAsideMaximized && { pl: 'xl' })}>
            <AppShell.Section
              mb="sm"
              pt="xl"
              pr={!isAsideMaximized ? 'xl' : 0}
              w={isAsideMaximized ? 'min(50%, 896px)' : '100%'}
              mx={isAsideMaximized ? 'auto' : 0}
            >
              <div className="tw-flex tw-flex-row tw-justify-between">
                <div>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    onClick={() => {
                      setAside({ open: false, offer: null })
                      setIsAsideMaximized(false)
                    }}
                  >
                    <XMarkIcon className="tw-w-5 tw-h-5 tw-fill-gray-900" />
                  </ActionIcon>

                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    onClick={() => setIsAsideMaximized((maximized) => !maximized)}
                    disabled={width <= 992}
                    className="disabled:tw-bg-transparent"
                  >
                    {isAsideMaximized ? (
                      <MinimizeIcon
                        className={classNames('tw-w-4 tw-h-4', width <= 992 ? 'tw-fill-gray-200' : 'tw-fill-gray-900')}
                      />
                    ) : (
                      <MaximizeIcon
                        className={classNames('tw-w-4 tw-h-4', width <= 992 ? 'tw-fill-gray-200' : 'tw-fill-gray-900')}
                      />
                    )}
                  </ActionIcon>
                </div>
                <div>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    disabled={!canNavigateToPreviousOffer()}
                    className="disabled:tw-bg-transparent"
                    onClick={navigateToPreviousOffer}
                  >
                    <BackwardStepIcon
                      className={classNames(
                        'tw-w-4 tw-h-4',
                        !canNavigateToPreviousOffer() ? 'tw-fill-gray-300' : 'tw-fill-gray-900',
                      )}
                    />
                  </ActionIcon>

                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    disabled={!canNavigateToNextOffer()}
                    className="disabled:tw-bg-transparent"
                    onClick={navigateToNextOffer}
                  >
                    <ForwardStepIcon
                      className={classNames(
                        'tw-w-4 tw-h-4 ',
                        !canNavigateToNextOffer() ? 'tw-fill-gray-300' : 'tw-fill-gray-900',
                      )}
                    />
                  </ActionIcon>
                </div>
              </div>
            </AppShell.Section>
            <AppShell.Section grow component={ScrollArea} pr={!isAsideMaximized ? 'xl' : 0}>
              <div className={classNames(isAsideMaximized && 'tw-w-1/2 tw-max-w-4xl tw-mx-auto')}>
                <OfferDescription />
              </div>
            </AppShell.Section>
          </AppShell.Aside> */}
      {/* <AppShell.Main style={{ height: '100vh', width: '100%' }}> */}
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
      style.textContent = styles + loadingDots + mantineStyles + mantineDatatableStyles
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
    </MantineProvider>
  )
}
