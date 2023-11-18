import { useLocalStorage } from "@mantine/hooks";
import { Offer } from "../../types";

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
