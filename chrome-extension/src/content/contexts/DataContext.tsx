import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { Offer, Location, UserWithPremium } from '../../types'
import { scrapeJobs } from '../../utils/scraping'
import { formatOffers } from '../utils/offerFormatting'
import { SelectableCity } from '../types'
import { useUser } from '../hooks/useUser'

type JobOffers = {
  offers: Offer[]
  lastUpdated: number
}

interface DataContextType {
  data: Offer[]
  dataDate: string
  isLoading: boolean
  locations: Location[][]
  citiesByCountry: Record<string, SelectableCity[]>
  companies: string[]
  newOffersCount: number
  refreshData: () => void
}

export const DataContext = createContext<DataContextType | undefined>(undefined)

const getOffersFromLocalStorage = (): JobOffers => {
  const storedOffers = localStorage.getItem('jobOffers')
  return storedOffers
    ? JSON.parse(storedOffers)
    : ({
        offers: [],
        lastUpdated: Date.now(),
      } as JobOffers)
}

const storeOffersInLocalStorage = (offers: Offer[]) => {
  localStorage.setItem(
    'jobOffers',
    JSON.stringify({
      offers: offers,
      lastUpdated: Date.now(),
    }),
  )
}

const getHiddenOffersNumbers = (): string[] => {
  return JSON.parse(localStorage.getItem('hidden-offers') ?? '[]')
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Offer[]>([])
  const [dataDate, setDataDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [newOffersCount, setNewOffersCount] = useState<number>(0)
  const { user } = useUser()

  const refreshData = useCallback(async () => {
    try {
      const { offers } = getOffersFromLocalStorage()

      // Get the offers that are not in the stored offers
      const newOffers = await scrapeJobs(
        offers.map((o) => o.id),
        (offersCount, offersLoaded) => {
          console.log(`Loaded ${offersLoaded} of ${offersCount} offers`)
        },
      )

      const newFormattedOffers = await formatOffers(newOffers)

      const refreshedOffers = offers.concat(newFormattedOffers)

      storeOffersInLocalStorage(refreshedOffers)

      const hiddenOffersNumbers = getHiddenOffersNumbers()

      setData(refreshedOffers.filter((d) => !hiddenOffersNumbers.includes(d.number)))
      setDataDate(new Date(Date.now()).toLocaleDateString('fr-CH'))

      setIsLoading(false)
    } catch (error) {
      console.error('Error refreshing data:', error)
      setError(new Error('Error refreshing data'))
    }
  }, [])

  useEffect(() => {
    const initializeOffers = async (user: UserWithPremium) => {
      console.log('initializeOffers', user)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const { offers } = getOffersFromLocalStorage()

          // Get the offers that are not in the stored offers
          const newOffers = await scrapeJobs(
            offers.map((o) => o.id),
            (offersCount, offersLoaded) => {
              console.log(`Loaded ${offersLoaded} of ${offersCount} offers`)
            },
          )

          if (!user.isPremium && user.formattingCount > 0) {
            console.log('User is not premium and has already formatted before, skipping automatic formatting')
            setNewOffersCount(newOffers.length)
            setIsLoading(false)
            return
          }

          let data: Offer[] = []

          if (newOffers.length > 0) {
            console.log('New offers found, formatting...')
            const formattedOffers = await formatOffers(newOffers)

            const refreshedOffers = offers.concat(formattedOffers)

            storeOffersInLocalStorage(refreshedOffers)

            data = refreshedOffers
          } else {
            data = offers
          }

          setData(data)
          setDataDate(new Date(Date.now()).toLocaleDateString('fr-CH'))
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error initializing offers:', error)
        setError(new Error('Error initializing offers'))
      }
    }

    console.log('user in useEffect', user)

    if (user) {
      initializeOffers(user)
    }
  }, [user])

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
    newOffersCount,
    refreshData,
  }

  if (error) {
    throw error
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
