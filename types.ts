export type RowData = {
  id: number;
  name: string;
  company: string;
  location: Location[];
  number: number;
  format: string;
  registered: number;
  positions: number;
  professor: string;
  creationDate: string;
  favorite: boolean;
};

export type Location = {
  city: string;
  country: string;
};

export type SelectableCity = { name: string; selected: boolean };

export type Format = "PDM coordonné" | "Stage" | "Stage ou PDM";

export type SelectableFormat = { name: Format; selected: boolean };
