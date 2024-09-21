/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState, useMemo } from 'react'
import styles from '../styles/index.css?inline'
import loadingDots from '../styles/loading-dots.css?inline'
import mantineStyles from '@mantine/core/styles.css?inline'
import mantineDatatableStyles from 'mantine-datatable/styles.css?inline'
import { MantineProvider, createTheme, ActionIcon, Anchor, AppShell, ScrollArea, Stack } from '@mantine/core'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useHotkeys, useViewportSize } from '@mantine/hooks'
import {
  asideAtom,
  formatAtom,
  formattingOffersAtom,
  isAsideMaximizedAtom,
  lengthAtom,
  loadingOffersAtom,
  locationsAtom,
  nbCitiesSelectedAtom,
} from './atoms'
import { useAsyncError } from './utils/error'
import { useAsideNavigation } from './utils/hooks'
import { abortFormatting, formatOffers } from './utils/offerFormatting'
import { Offer, OfferToBeFormatted } from '../../../types'
import { SelectableCity, SelectableLength } from './types'
import { scrapeJobs } from '../utils/scraping'
import ActionBar from './components/ActionBar'
import Table from './components/Table'
import OfferDescription from './components/OfferDescription'
import BackwardStepIcon from './components/icons/BackwardStepIcon'
import ForwardStepIcon from './components/icons/ForwardStepIcon'
import MaximizeIcon from './components/icons/MaximizeIcon'
import MinimizeIcon from './components/icons/MinimizeIcon'
import XMarkIcon from './components/icons/XMarkIcon'
import classNames from 'classnames'
import List from './components/List'

const NOT_SPECIFIED = 'Not specified'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const style = document.createElement('style')
      style.textContent = styles + loadingDots + mantineStyles + mantineDatatableStyles
      containerRef.current.getRootNode().appendChild(style)
    }
  }, [])

  const [data, setData] = useState<Offer[]>([])
  // @ts-ignore
  const [dataDate, setDataDate] = useState<string>('')
  // @ts-ignore
  const [isError, setIsError] = useState<boolean>(false)
  const [isScrapingOffers, setIsScrapingOffers] = useState(false)

  const loadOffers = async () => {
    const data = localStorage.getItem('jobOffers')

    console.log('Loading job offers from local storage of the extension')

    if (data) {
      const { offers, lastUpdated }: { offers: Offer[]; lastUpdated: string } = JSON.parse(data)

      setData(offers)
      setDataDate(new Date(lastUpdated).toLocaleDateString('fr-CH'))
    } else {
      updateData()
    }

    setIsLoadingOffers(false)
  }

  const throwError = useAsyncError()

  const updateData = async () => {
    setIsFormattingOffers(true)

    const data = localStorage.getItem('offersToBeFormatted')

    if (!data) {
      return
    }

    console.log('offersToBeFormatted saved in local storage', data)

    const {
      offers,
      lastUpdated,
    }: {
      offers: OfferToBeFormatted[]
      lastUpdated: string
    } = JSON.parse(data)

    console.log('offersToBeFormatted', offers)

    setDataDate(new Date(lastUpdated).toLocaleDateString('fr-CH'))

    window.onbeforeunload = function () {
      return 'Data is currently processed and will be lost if you leave the page, are you sure?'
    }
    window.onunload = function () {
      abortFormatting()
    }

    let formattedOffers
    try {
      formattedOffers = await formatOffers(offers)
    } catch (error) {
      throwError(error)
      setIsFormattingOffers(false)
      window.onbeforeunload = null
      window.onunload = null
      return
    }

    window.onbeforeunload = null
    window.onunload = null

    if (formattedOffers === null) {
      console.log('An error occured while formatting the offers')
      setIsError(true)
      return
    }

    localStorage.setItem(
      'jobOffers',
      JSON.stringify({
        offers: formattedOffers,
        lastUpdated,
      }),
    )

    setData(formattedOffers)

    setIsFormattingOffers(false)
  }

  const scrapeAndStoreOffers = async () => {
    setIsScrapingOffers(true)
    try {
      const jobOffers = await scrapeJobs((offersCount, offersLoaded) => {
        // You can use this callback to update UI if needed
        console.log(`Loaded ${offersLoaded} of ${offersCount} offers`)
      })

      localStorage.setItem(
        'offersToBeFormatted',
        JSON.stringify({
          offers: jobOffers,
          lastUpdated: Date.now(),
        }),
      )

      console.log('jobOffers saved in local storage', jobOffers)

      updateData()
    } catch (error) {
      console.error('Error scraping offers:', error)
      setIsError(true)
    } finally {
      setIsScrapingOffers(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedOffers = localStorage.getItem('jobOffers')
      const offersToBeFormatted = localStorage.getItem('offersToBeFormatted')
      if (storedOffers) {
        loadOffers()
      } else if (offersToBeFormatted) {
        updateData()
      } else {
        scrapeAndStoreOffers()
      }
    }
  }, [])

  const locations = useMemo(() => data.map((d) => d.location), [data])

  const citiesByCountry = useMemo(() => {
    const citiesByCountry: Record<string, SelectableCity[]> = {}
    locations.flat().forEach((l) => {
      // eslint-disable-next-line no-prototype-builtins
      if (l.country !== null && citiesByCountry.hasOwnProperty(l.country)) {
        if (citiesByCountry[l.country]?.map((c) => c.name).includes(l.city) || l.city === null) {
          return
        }
        citiesByCountry[l.country]?.push({ name: l.city, selected: false })
      } else {
        citiesByCountry[l.country ?? NOT_SPECIFIED] = [{ name: l.city, selected: false }]
      }
    })

    Object.keys(citiesByCountry).forEach((country) => {
      citiesByCountry[country] = citiesByCountry[country].sort((a, b) => a.name.localeCompare(b.name))
    })
    return citiesByCountry
  }, [locations])

  const setSelectableFormats = useSetAtom(formatAtom)
  const setSelectableLengths = useSetAtom(lengthAtom)
  const setSelectableLocations = useSetAtom(locationsAtom)
  // @ts-ignore
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom)
  const setIsFormattingOffers = useSetAtom(formattingOffersAtom)
  const setIsLoadingOffers = useSetAtom(loadingOffersAtom)
  const [{ open: isAsideOpen }, setAside] = useAtom(asideAtom)
  const [isAsideMaximized, setIsAsideMaximized] = useAtom(isAsideMaximizedAtom)

  useHotkeys([
    [
      'Enter',
      () => {
        if (isAsideOpen) setIsAsideMaximized((v) => !v)
      },
    ],
    [
      'Escape',
      () => {
        setAside({ open: false, offer: null })
        setIsAsideMaximized(false)
      },
    ],
  ])

  useEffect(() => {
    setSelectableFormats([
      { name: 'internship', selected: false },
      { name: 'project', selected: false },
    ])
  }, [setSelectableFormats])

  useEffect(() => {
    setSelectableLengths(
      Array.from(new Set(data.flatMap((d) => d.length))).map((length) => {
        return { name: length, selected: false }
      }) as SelectableLength[],
    )
  }, [data, setSelectableLengths])

  // @ts-ignore
  const companies = useMemo(() => {
    return Array.from(new Set(data.flatMap((d) => d.company))).sort((a, b) => a.localeCompare(b))
  }, [data])

  useEffect(() => {
    setSelectableLocations(citiesByCountry)
  }, [citiesByCountry, setSelectableLocations])

  const { canNavigateToNextOffer, canNavigateToPreviousOffer, navigateToNextOffer, navigateToPreviousOffer } =
    useAsideNavigation()

  const { width } = useViewportSize()

  useEffect(() => {
    if (width <= 992 && isAsideMaximized) {
      setIsAsideMaximized(false)
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

  const theme = createTheme({
    /** Put your mantine theme override here */
    primaryColor: 'red',
  })

  return (
    <MantineProvider
      theme={theme}
      getRootElement={() => containerRef.current!}
      cssVariablesSelector="#extension-main-container"
    >
      <div ref={containerRef} id="extension-main-container" className="tw-bg-white tw-text-sm tw-font-sans tw-h-full">
        <AppShell
          aside={{
            width: {
              md: isAsideMaximized ? '100%' : 550,
              lg: isAsideOpen ? (isAsideMaximized ? '100%' : 'max(40%, 550px)') : 0,
            },
            breakpoint: 'md',
            collapsed: { mobile: !isAsideOpen, desktop: !isAsideOpen },
          }}
          padding="xl"
          style={{ height: '100%' }}
        >
          <div className="tw-px-8 tw-pt-8">
            <ActionBar nbCitiesSelected={nbCitiesSelected} companies={companies} dataDate={dataDate} />
          </div>
          {/* Used the hack below to remove the padding when aside is closed and size is 0, otherwise the aside was still visible */}
          <AppShell.Aside {...(isAsideOpen && !isAsideMaximized && { pl: 'xl' })}>
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
          {/* <AppShell.Main style={{ height: '100vh', width: '100%' }}> */}
          <main className="tw-flex tw-flex-row tw-justify-between tw-w-full tw-px-8 tw-gap-x-8 tw-h-full">
            <Stack style={{ height: '100%' }}>
              {isError ? (
                <div className="tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center">
                  <h3 className="tw-text-2xl tw-text-[#868e96] tw-font-semibold">
                    Oups... <span className="tw-text-3xl">🙇‍♂️</span>
                  </h3>
                  <h3 className="tw-text-xl tw-text-[#868e96] tw-font-medium">
                    Something went wrong while loading the data
                  </h3>
                  <p className="tw-text-lg tw-text-[#868e96]">
                    Please try again (we never know <span className="tw-text-xl">🤷‍♂️</span>) & contact Pierre Véron on{' '}
                    <Anchor href="https://www.linkedin.com/in/pierre-veron/" target="_blank">
                      Linkedin
                    </Anchor>{' '}
                    or by <Anchor href="mailto:pierre.veron@epfl.ch">email</Anchor>
                  </p>
                </div>
              ) : (
                // <Table data={data} />
                <List data={data} />
              )}
            </Stack>
            <OfferDescription />
          </main>
          {/* </AppShell.Main> */}
        </AppShell>
        {isScrapingOffers ? <div>Scraping offers... Please wait.</div> : <Table data={data} />}
      </div>
    </MantineProvider>
  )
}
