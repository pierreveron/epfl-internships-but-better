export type RowData = {
  id: number;
  title: string;
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
  salary: number | null;
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
