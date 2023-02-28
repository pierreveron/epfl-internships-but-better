import { SelectableCity, SelectableFormat } from "@/types";
import { atom } from "jotai";

export const locationsAtom = atom<Record<string, SelectableCity[]>>({});

export const formatAtom = atom<SelectableFormat[]>([]);
export const showOnlyPositionsNotYetCompletedAtom = atom<boolean>(false);

export const nbCitiesSelectedAtom = atom((get) => {
  const locations = get(locationsAtom);
  return Object.keys(locations).reduce((acc, country) => {
    const cities = locations[country];
    const selectedCities = cities?.filter((city) => city.selected);
    return acc + (selectedCities?.length || 0);
  }, 0);
});
