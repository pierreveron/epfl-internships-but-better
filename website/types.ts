export type RowData = {
  id: number;
  name: string;
  company: string;
  location: Location[];
  number: number;
  format: Format[];
  registered: number;
  positions: number;
  professor: string;
  length: string;
  creationDate: string;
  favorite: boolean;
};

export type Location = {
  city: string;
  country: string;
};

export type SelectableCity = { name: string; selected: boolean };

export type Format = "internship" | "project";

type Selectable = { selected: boolean };

export type SelectableFormat = { name: Format } & Selectable;

export type SelectableLength = { name: string } & Selectable;

export type SelectableCompany = { name: string } & Selectable;
