import { SelectableCity, SelectableFormat, SelectableLength } from "@/types";
import { atom } from "jotai";

export const formattingOffersAtom = atom<boolean>(false);

export const locationsAtom = atom<Record<string, SelectableCity[]>>({});

export const formatAtom = atom<SelectableFormat[]>([]);
export const lengthAtom = atom<SelectableLength[]>([]);
export const companyAtom = atom<string | null>(null);
export const showOnlyPositionsNotYetCompletedAtom = atom<boolean>(false);
export const showOnlyFavoritesAtom = atom<boolean>(false);
export const isAsideOpenAtom = atom<boolean>(false);

export const nbCitiesSelectedAtom = atom((get) => {
  const locations = get(locationsAtom);
  return Object.keys(locations).reduce((acc, country) => {
    const cities = locations[country];
    const selectedCities = cities?.filter((city) => city.selected);
    return acc + (selectedCities?.length || 0);
  }, 0);
});
