import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { Offer, OfferToBeFormatted, Location } from '../../../types'
import { scrapeJobs } from '../utils/scraping'
import { formatOffers, abortFormatting } from './utils/offerFormatting'
import { SelectableCity } from './types'

interface DataContextType {
  data: Offer[]
  dataDate: string
  isFormattingOffers: boolean
  isLoadingOffers: boolean
  locations: Location[][]
  citiesByCountry: Record<string, SelectableCity[]>
  companies: string[]
  updateData: () => Promise<void>
  scrapeAndStoreOffers: () => Promise<void>
}

export const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Offer[]>([])
  const [dataDate, setDataDate] = useState<string>('')
  const [isFormattingOffers, setIsFormattingOffers] = useState<boolean>(false)
  const [isLoadingOffers, setIsLoadingOffers] = useState<boolean>(true)

  const updateData = useCallback(async () => {
    setIsFormattingOffers(true)

    const storedData = localStorage.getItem('offersToBeFormatted')

    if (!storedData) {
      setIsFormattingOffers(false)
      return
    }

    console.log('offersToBeFormatted saved in local storage', storedData)

    const {
      offers,
      lastUpdated,
    }: {
      offers: OfferToBeFormatted[]
      lastUpdated: string
    } = JSON.parse(storedData)

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
      console.error('An error occured while formatting the offers', error)
      setIsFormattingOffers(false)
      window.onbeforeunload = null
      window.onunload = null
      throw new Error('An error occured while formatting the offers')
    }

    window.onbeforeunload = null
    window.onunload = null

    if (formattedOffers === null) {
      console.log('An error occured while formatting the offers')
      throw new Error('An error occured while formatting the offers')
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
  }, [])

  const loadOffers = useCallback(async () => {
    const storedData = localStorage.getItem('jobOffers')

    console.log('Loading job offers from local storage of the extension')

    if (storedData) {
      const { offers, lastUpdated }: { offers: Offer[]; lastUpdated: string } = JSON.parse(storedData)

      const hiddenOffers = JSON.parse(localStorage.getItem('hidden-offers') ?? '[]')

      setData(offers.filter((d) => !hiddenOffers.includes(d.number)))
      setDataDate(new Date(lastUpdated).toLocaleDateString('fr-CH'))
    } else {
      await updateData()
    }

    setIsLoadingOffers(false)
  }, [updateData])

  const scrapeAndStoreOffers = useCallback(async () => {
    try {
      const jobOffers = await scrapeJobs((offersCount, offersLoaded) => {
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

      await updateData()
    } catch (error) {
      console.error('Error scraping offers:', error)
      throw new Error('Error scraping offers')
    }
  }, [updateData])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedOffers = localStorage.getItem('jobOffers')
      const offersToBeFormatted = localStorage.getItem('offersToBeFormatted')
      if (storedOffers) {
        loadOffers()
      } else if (offersToBeFormatted) {
        updateData()
      } else {
        scrapeAndStoreOffers().catch((error) => {
          console.error('Error scraping offers:', error)
          throw new Error('Error scraping offers')
        })
      }
    }
  }, [loadOffers, scrapeAndStoreOffers, updateData])

  const locations = useMemo(() => data.map((d) => d.location), [data])

  const citiesByCountry = useMemo(() => {
    const citiesByCountry: Record<string, SelectableCity[]> = {}
    locations.flat().forEach((l) => {
      if (l.country !== null && l.country in citiesByCountry) {
        if (citiesByCountry[l.country]?.map((c) => c.name).includes(l.city) || l.city === null) {
          return
        }
        citiesByCountry[l.country]?.push({ name: l.city, selected: false })
      } else {
        citiesByCountry[l.country ?? 'Not specified'] = [{ name: l.city, selected: false }]
      }
    })

    Object.keys(citiesByCountry).forEach((country) => {
      citiesByCountry[country] = citiesByCountry[country].sort((a, b) => a.name.localeCompare(b.name))
    })
    return citiesByCountry
  }, [locations])

  const companies = useMemo(() => {
    return Array.from(new Set(data.flatMap((d) => d.company))).sort((a, b) => a.localeCompare(b))
  }, [data])

  const value = {
    data,
    dataDate,
    isFormattingOffers,
    isLoadingOffers,
    locations,
    citiesByCountry,
    companies,
    updateData,
    scrapeAndStoreOffers,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
