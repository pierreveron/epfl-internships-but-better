import React, { createContext, useState, useEffect, useMemo, useRef } from 'react'
import { Offer, Location, UserWithData } from '../../types'
import { detectNewJobs, scrapeJobs } from '../utils/scraping'
import { formatOffers } from '../utils/offerFormatting'
import { SelectableCity } from '../types'
import { useUser } from '../hooks/useUser'
import {
  jobOffersFromLocalStorage,
  hiddenOffersFromLocalStorage,
  favoriteOffersFromLocalStorage,
} from '../../localStorage'

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
  isFormatting: boolean
  offersLoaded: number
  locations: Location[][]
  citiesByCountry: Record<string, SelectableCity[]>
  companies: string[]
  newOffersCount: number
}

export const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Offer[]>([])
  const [dataDate, setDataDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFormatting, setIsFormatting] = useState<boolean>(false)
  const [offersLoaded, setOffersLoaded] = useState<number>(0)
  const [error, setError] = useState<Error | null>(null)
  const [newOffersCount, setNewOffersCount] = useState<number>(0)
  const { user } = useUser()
  const userInitializedRef = useRef(false)
  const [favoriteOffers, setFavoriteOffers] = useState<string[]>([])
  const [hiddenOffers, setHiddenOffers] = useState<string[]>([])

  useEffect(() => {
    favoriteOffersFromLocalStorage.get().then(setFavoriteOffers)
    hiddenOffersFromLocalStorage.get().then(setHiddenOffers)
  }, [])

  const toggleFavoriteOffer = (offer: Offer) => {
    const id = offer.number
    setFavoriteOffers((ids) => {
      const newIds = ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id]
      favoriteOffersFromLocalStorage.set(newIds)
      return newIds
    })
  }

  const isOfferFavorite = (offer: Offer) => favoriteOffers.includes(offer.number)

  const toggleHiddenOffer = (offer: Offer) => {
    const id = offer.number
    setHiddenOffers((ids) => {
      const newIds = ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id]
      hiddenOffersFromLocalStorage.set(newIds)
      return newIds
    })
  }

  const isOfferHidden = (offer: Offer) => hiddenOffers.includes(offer.number)

  useEffect(() => {
    const initializeOffers = async (user: UserWithData): Promise<{ data: Offer[]; dataDate: string }> => {
      console.log('initializeOffers', user)
      if (user.email) {
        try {
          const { offers: currentOffers } = await jobOffersFromLocalStorage.get()

          console.log('currentOffers', currentOffers.length)

          const currentJobsIds = currentOffers.map((o) => o.id)

          const newJobsIds = await detectNewJobs(currentJobsIds)

          setNewOffersCount(newJobsIds.length)

          // Get the offers that are not in the stored offers
          const newOffers = await scrapeJobs(newJobsIds, (offersCount, offersLoaded) => {
            console.log(`Loaded ${offersLoaded} of ${offersCount} offers`)
            setOffersLoaded(offersLoaded)
          })

          let data: Offer[] = []

          if (newOffers.length > 0) {
            console.log('New offers found, formatting...')
            setIsFormatting(true)
            const formattedOffers = await formatOffers(user.email, newOffers)
            console.log('New offers formatted', formattedOffers)

            const refreshedOffers = currentOffers.concat(formattedOffers)
            await jobOffersFromLocalStorage.set({ offers: refreshedOffers, lastUpdated: Date.now() })

            data = refreshedOffers
          } else {
            data = currentOffers
          }

          setNewOffersCount(0)

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
        setIsFormatting(false)
      })
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
    isFormatting,
    offersLoaded,
    locations,
    citiesByCountry,
    companies,
    newOffersCount,
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
