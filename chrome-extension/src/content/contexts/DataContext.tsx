import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { Offer, OfferToBeFormatted, Location } from '../../types'
import { scrapeJobs } from '../../utils/scraping'
import { formatOffers } from '../utils/offerFormatting'
import { SelectableCity } from '../types'

interface DataContextType {
  data: Offer[]
  dataDate: string
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const updateData = useCallback(async () => {
    setIsLoading(true)

    const storedData = localStorage.getItem('offersToBeFormatted')

    if (!storedData) {
      setIsLoading(false)
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

    let formattedOffers: Offer[] | null = null
    try {
      formattedOffers = await formatOffers(offers)
    } catch (error) {
      console.error('An error occured while formatting the offers', error)
      setIsLoading(false)
      window.onbeforeunload = null
      window.onunload = null
      setError(new Error('An error occured while formatting the offers'))
    }

    window.onbeforeunload = null
    window.onunload = null

    if (formattedOffers === null) {
      setError(new Error('An error occured while formatting the offers'))
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
    setIsLoading(false)
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

    setIsLoading(false)
  }, [updateData])

  const scrapeAndStoreOffers = useCallback(async () => {
    setIsLoading(true)
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
      setIsLoading(false)
      setError(new Error('Error scraping offers'))
    }
  }, [updateData])

  useEffect(() => {
    const initializeOffers = async () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedOffers = localStorage.getItem('jobOffers')
        const offersToBeFormatted = localStorage.getItem('offersToBeFormatted')
        try {
          if (storedOffers) {
            await loadOffers()
          } else if (offersToBeFormatted) {
            await updateData()
          } else {
            await scrapeAndStoreOffers()
          }
        } catch (error) {
          setIsLoading(false)
          setError(error as Error)
        }
      }
    }

    initializeOffers()
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
    isLoading,
    locations,
    citiesByCountry,
    companies,
    updateData,
    scrapeAndStoreOffers,
  }

  if (error) {
    throw error
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
