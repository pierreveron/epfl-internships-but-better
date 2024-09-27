import { useHotkeys, useLocalStorage } from '@mantine/hooks'
import { useMemo } from 'react'
import { Offer } from '../../types'
import { useAside } from '../hooks/useAside'
import { useFilter } from '../hooks/useFilter'
import { usePagination } from '../hooks/usePagination'
import { useSort } from '../hooks/useSort'

export const useHiddenOffers = () => {
  const [hiddenOffers, setHiddenOffers] = useLocalStorage({
    key: 'hidden-offers',
    getInitialValueInEffect: true,
    defaultValue: [] as string[],
  })

  const toggleHiddenOffer = (offer: Offer) => {
    const id = offer.number
    setHiddenOffers((ids) => {
      if (ids.includes(id)) {
        return ids.filter((currentId) => currentId !== id)
      }

      return [...ids, id]
    })
  }

  const isOfferHidden = useMemo(() => {
    return (offer: Offer) => hiddenOffers.includes(offer.number)
  }, [hiddenOffers])

  return { hiddenOffers, toggleHiddenOffer, isOfferHidden }
}

export const useFavoriteOffers = () => {
  const [favoriteOffers, setFavoriteOffers] = useLocalStorage({
    key: 'favorite-offers',
    getInitialValueInEffect: true,
    defaultValue: [] as string[],
  })

  const { offer } = useAside()

  useHotkeys([
    [
      'mod+S',
      () => {
        if (offer) toggleFavoriteOffer(offer)
      },
    ],
  ])

  const toggleFavoriteOffer = (offer: Offer) => {
    const id = offer.number
    setFavoriteOffers((ids) => {
      if (ids.includes(id)) {
        return ids.filter((currentId) => currentId !== id)
      }

      return [...ids, id]
    })
  }

  const isOfferFavorite = useMemo(() => {
    return (offer: Offer) => favoriteOffers.includes(offer.number)
  }, [favoriteOffers])

  return { favoriteOffers, toggleFavoriteOffer, isOfferFavorite }
}

export const useAsideNavigation = () => {
  const { offer, setOffer: setAside } = useAside()
  const { filteredData: filteredOffers } = useFilter()
  const { isOfferHidden } = useHiddenOffers()
  const { sortStatus } = useSort()

  const { setPage, pageSize } = usePagination()

  useHotkeys([
    ['ArrowRight', () => navigateToNextOffer()],
    ['ArrowLeft', () => navigateToPreviousOffer()],
  ])

  const finalOffers = useMemo(() => {
    const visibleOffers = filteredOffers.filter((currentOffer) => !isOfferHidden(currentOffer))

    let finalOffers = visibleOffers

    if (sortStatus.direction === 'desc') {
      finalOffers = finalOffers.slice().reverse()
    }

    return finalOffers
  }, [filteredOffers, isOfferHidden, sortStatus])

  const canNavigateToNextOffer = () => {
    if (!offer) {
      return false
    }

    const currentOfferIndex = finalOffers.findIndex((currentOffer) => currentOffer.number === offer.number)

    return currentOfferIndex < finalOffers.length - 1
  }

  const canNavigateToPreviousOffer = () => {
    if (!offer) {
      return false
    }

    const currentOfferIndex = finalOffers.findIndex((currentOffer) => currentOffer.number === offer.number)

    return currentOfferIndex > 0
  }

  const navigateToNextOffer = () => {
    if (!offer) {
      return
    }

    const currentOfferIndex = finalOffers.findIndex((currentOffer) => currentOffer.number === offer.number)

    if (currentOfferIndex < finalOffers.length - 1) {
      const nextOfferIndex = currentOfferIndex + 1
      const nextOffer = finalOffers[nextOfferIndex]
      setAside(nextOffer)

      const newPage = Math.floor(nextOfferIndex / pageSize) + 1
      setPage(newPage)
    }
  }

  const navigateToPreviousOffer = () => {
    if (!offer) {
      return
    }

    const currentOfferIndex = finalOffers.findIndex((currentOffer) => currentOffer.number === offer.number)

    if (currentOfferIndex > 0) {
      const previousOfferIndex = currentOfferIndex - 1
      const previousOffer = finalOffers[previousOfferIndex]
      setAside(previousOffer)

      const newPage = Math.floor(previousOfferIndex / pageSize) + 1
      setPage(newPage)
    }
  }

  return {
    canNavigateToNextOffer,
    canNavigateToPreviousOffer,
    navigateToNextOffer,
    navigateToPreviousOffer,
    //   hideOffer,
  }
}
