import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Offer } from "../../types";
import { useAtom, useAtomValue } from "jotai";
import { asideAtom, filteredOffersAtom, sortStatusAtom } from "@/atoms";
import { useMemo } from "react";

export const useHiddenOffers = () => {
  const [hiddenOffers, setHiddenOffers] = useLocalStorage({
    key: "hidden-offers",
    getInitialValueInEffect: true,
    defaultValue: [] as string[],
  });

  const toggleHiddenOffer = (offer: Offer) => {
    const id = offer.number;
    setHiddenOffers((ids) => {
      if (ids.includes(id)) {
        return ids.filter((currentId) => currentId !== id);
      }

      return [...ids, id];
    });
  };

  const isOfferHidden = (offer: Offer) => {
    return hiddenOffers.includes(offer.number);
  };

  return { hiddenOffers, toggleHiddenOffer, isOfferHidden };
};

export const useFavoriteOffers = () => {
  const [favoriteOffers, setFavoriteOffers] = useLocalStorage({
    key: "favorite-offers",
    getInitialValueInEffect: true,
    defaultValue: [] as string[],
  });

  const toggleFavoriteOffer = (offer: Offer) => {
    const id = offer.number;
    setFavoriteOffers((ids) => {
      if (ids.includes(id)) {
        return ids.filter((currentId) => currentId !== id);
      }

      return [...ids, id];
    });
  };

  const isOfferFavorite = (offer: Offer) => {
    return favoriteOffers.includes(offer.number);
  };

  return { favoriteOffers, toggleFavoriteOffer, isOfferFavorite };
};

export const useAsideNavigation = () => {
  const [{ offer }, setAside] = useAtom(asideAtom);
  const filteredOffers = useAtomValue(filteredOffersAtom);
  const { isOfferHidden } = useHiddenOffers();
  const sortStatus = useAtomValue(sortStatusAtom);

  useHotkeys([
    ["ArrowRight", () => navigateToNextOffer()],
    ["ArrowLeft", () => navigateToPreviousOffer()],
  ]);

  const finalOffers = useMemo(() => {
    const visibleOffers = filteredOffers.filter(
      (currentOffer) => !isOfferHidden(currentOffer)
    );

    let finalOffers = visibleOffers;

    if (sortStatus.direction === "desc") {
      finalOffers = finalOffers.slice().reverse();
    }

    return finalOffers;
  }, [filteredOffers, isOfferHidden, sortStatus]);

  const canNavigateToNextOffer = () => {
    if (!offer) {
      return false;
    }

    const currentOfferIndex = finalOffers.findIndex(
      (currentOffer) => currentOffer.number === offer.number
    );

    return currentOfferIndex < finalOffers.length - 1;
  };

  const canNavigateToPreviousOffer = () => {
    if (!offer) {
      return false;
    }

    const currentOfferIndex = finalOffers.findIndex(
      (currentOffer) => currentOffer.number === offer.number
    );

    return currentOfferIndex > 0;
  };

  const navigateToNextOffer = () => {
    if (!offer) {
      return;
    }

    const currentOfferIndex = finalOffers.findIndex(
      (currentOffer) => currentOffer.number === offer.number
    );

    if (currentOfferIndex < finalOffers.length - 1) {
      const nextOffer = finalOffers[currentOfferIndex + 1];
      setAside({ open: true, offer: nextOffer });
    }
  };

  const navigateToPreviousOffer = () => {
    if (!offer) {
      return;
    }

    const currentOfferIndex = finalOffers.findIndex(
      (currentOffer) => currentOffer.number === offer.number
    );

    if (currentOfferIndex > 0) {
      const previousOffer = finalOffers[currentOfferIndex - 1];
      setAside({ open: true, offer: previousOffer });
    }
  };

  return {
    canNavigateToNextOffer,
    canNavigateToPreviousOffer,
    navigateToNextOffer,
    navigateToPreviousOffer,
    //   hideOffer,
  };
};
