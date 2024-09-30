import React, { createContext, useState, useContext, useEffect, useMemo, useCallback, useRef } from 'react'
import { Offer, Location, UserWithPremium } from '../../types'
import { scrapeJobs } from '../../utils/scraping'
import { formatOffers } from '../utils/offerFormatting'
import { SelectableCity } from '../types'
import { useUser } from '../hooks/useUser'
import { getStorageData, setStorageData } from '../utils/storage'

type JobOffers = {
  offers: Offer[]
  lastUpdated: number
}

interface DataContextType {
  favoriteOffers: string[]
  toggleFavoriteOffer: (offer: Offer) => void
  isOfferFavorite: (offer: Offer) => boolean
  hiddenOffers: string[]
  toggleHiddenOffer: (offer: Offer) => void
  isOfferHidden: (offer: Offer) => boolean
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

const getOffersFromLocalStorage = async (): Promise<JobOffers> => {
  const result = (await chrome.storage.local.get('jobOffers')) as { jobOffers?: JobOffers }
  return (
    result.jobOffers || {
      offers: [],
      lastUpdated: Date.now(),
    }
  )
}

const storeOffersInLocalStorage = (offers: Offer[]) => {
  chrome.storage.local.set({
    jobOffers: {
      offers: offers,
      lastUpdated: Date.now(),
    },
  })
}

const getHiddenOffersNumbers = async (): Promise<string[]> => {
  const result = await chrome.storage.local.get('hidden-offers')
  return result['hidden-offers'] || []
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Offer[]>([])
  const [dataDate, setDataDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [newOffersCount, setNewOffersCount] = useState<number>(0)
  const { user, increaseFormattingCount } = useUser()
  const userInitializedRef = useRef(false)
  const [favoriteOffers, setFavoriteOffers] = useState<string[]>([])
  const [hiddenOffers, setHiddenOffers] = useState<string[]>([])

  useEffect(() => {
    getStorageData('favorite-offers', []).then(setFavoriteOffers)
    getStorageData('hidden-offers', []).then(setHiddenOffers)
  }, [])

  const toggleFavoriteOffer = (offer: Offer) => {
    const id = offer.number
    setFavoriteOffers((ids) => {
      const newIds = ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id]
      setStorageData('favorite-offers', newIds)
      return newIds
    })
  }

  const isOfferFavorite = (offer: Offer) => favoriteOffers.includes(offer.number)

  const toggleHiddenOffer = (offer: Offer) => {
    const id = offer.number
    setHiddenOffers((ids) => {
      const newIds = ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id]
      setStorageData('hidden-offers', newIds)
      return newIds
    })
  }

  const isOfferHidden = (offer: Offer) => hiddenOffers.includes(offer.number)

  const refreshData = useCallback(async () => {
    if (!user || !user.email) {
      return
    }

    setIsLoading(true)

    try {
      const { offers } = await getOffersFromLocalStorage()
      // Get the offers that are not in the stored offers
      const newOffers = await scrapeJobs(
        offers.map((o) => o.id),
        (offersCount, offersLoaded) => {
          console.log(`Loaded ${offersLoaded} of ${offersCount} offers`)
        },
      )

      const newFormattedOffers = await formatOffers(user.email, newOffers)

      const refreshedOffers = offers.concat(newFormattedOffers)

      storeOffersInLocalStorage(refreshedOffers)

      const hiddenOffersNumbers = await getHiddenOffersNumbers()

      setData(refreshedOffers.filter((d) => !hiddenOffersNumbers.includes(d.number)))
      setDataDate(new Date(Date.now()).toLocaleDateString('fr-CH'))
      setNewOffersCount(0)
      increaseFormattingCount()
    } catch (error) {
      console.error('Error refreshing data:', error)
      setError(new Error('Error refreshing data'))
    }

    setIsLoading(false)
  }, [increaseFormattingCount, user])

  useEffect(() => {
    const initializeOffers = async (user: UserWithPremium): Promise<{ data: Offer[]; dataDate: string }> => {
      console.log('initializeOffers', user)
      if (user.email) {
        try {
          const { offers } = await getOffersFromLocalStorage()

          // Get the offers that are not in the stored offers
          const newOffers = await scrapeJobs(
            offers.map((o) => o.id),
            (offersCount, offersLoaded) => {
              console.log(`Loaded ${offersLoaded} of ${offersCount} offers`)
            },
          )

          setNewOffersCount(newOffers.length)

          if (user.isPremium || user.formattingCount == 0) {
            // Skip the next condition and proceed with formatting
            // This is because the user is premium and can format offers automatically
          } else if (offers.length === 0 && newOffers.length !== 0 && user.formattingCount < 4) {
            // Skip the next condition and proceed with formatting
            // This can happen if the user has deleted local storage but still having formatting credits
          } else {
            console.log('User is not premium and has already formatted before, skipping automatic formatting')
            return { data: offers, dataDate: new Date(Date.now()).toLocaleDateString('fr-CH') }
          }

          let data: Offer[] = []

          if (newOffers.length > 0) {
            console.log('New offers found, formatting...')
            const formattedOffers = await formatOffers(user.email, newOffers)
            increaseFormattingCount()

            const refreshedOffers = offers.concat(formattedOffers)

            storeOffersInLocalStorage(refreshedOffers)

            data = refreshedOffers
          } else {
            data = offers
          }

          return { data, dataDate: new Date(Date.now()).toLocaleDateString('fr-CH') }
        } catch (error) {
          console.error('Error initializing offers:', error)
          setError(new Error('Error initializing offers'))
        }
      }

      return { data: [], dataDate: new Date(Date.now()).toLocaleDateString('fr-CH') }
    }

    if (user && !userInitializedRef.current) {
      console.log('Initializing user data')
      userInitializedRef.current = true
      initializeOffers(user).then(({ data, dataDate }) => {
        setData(data)
        setDataDate(dataDate)
        setIsLoading(false)
      })
    }
  }, [user, increaseFormattingCount])

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
    favoriteOffers,
    toggleFavoriteOffer,
    isOfferFavorite,
    hiddenOffers,
    toggleHiddenOffer,
    isOfferHidden,
  }

  if (error) {
    throw error
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
