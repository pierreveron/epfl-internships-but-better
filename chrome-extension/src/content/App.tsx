/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from 'react'
import styles from '../styles/index.css?inline'
import loadingDots from '../styles/loading-dots.css?inline'
import mantineStyles from '@mantine/core/styles.css?inline'
import mantineDatatableStyles from 'mantine-datatable/styles.css?inline'
import Table from './components/Table'
import { MantineProvider, createTheme } from '@mantine/core'
import { useState, useMemo } from 'react'
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
// import { useAsideNavigation } from './utils/hooks'
import { abortFormatting, formatOffers } from './utils/offerFormatting'
import { Offer, OfferToBeFormatted } from '../../../types'
import { SelectableCity, SelectableLength } from './types'

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

    const {
      offers,
      lastUpdated,
    }: {
      offers: OfferToBeFormatted[]
      lastUpdated: string
    } = JSON.parse(data)

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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.addEventListener('jobOffersUpdated', () => {
        console.log('jobOffersUpdated')
        updateData()
      })

      loadOffers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // const { canNavigateToNextOffer, canNavigateToPreviousOffer, navigateToNextOffer, navigateToPreviousOffer } =
  //   useAsideNavigation()

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
    <div ref={containerRef}>
      <MantineProvider theme={theme}>
        {/* <h1 className="tw-text-3xl tw-font-bold tw-underline">Hello ISA EPFL!</h1> */}
        <Table data={data} />
      </MantineProvider>
    </div>
  )
}
