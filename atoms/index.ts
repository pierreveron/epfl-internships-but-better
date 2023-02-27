import { Format, SelectableCity, SelectableFormat } from "@/types";
import { atom } from "jotai";

export const locationsAtom = atom<Record<string, SelectableCity[]>>({});

export const formatAtom = atom<SelectableFormat[]>([]);
