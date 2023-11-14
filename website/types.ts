import { Format } from "../types";

export type SelectableCity = { name: string; selected: boolean };

type Selectable = { selected: boolean };

export type SelectableFormat = { name: Format } & Selectable;

export type SelectableLength = { name: string } & Selectable;

export type SelectableCompany = { name: string } & Selectable;
