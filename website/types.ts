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
  salary: number;
};

export type Location = {
  city: string;
  country: string;
};

export type SelectableCity = { name: string; selected: boolean };

export type Format = "internship" | "project";

export type SelectableFormat = { name: Format; selected: boolean };

export type SelectableLength = { name: string; selected: boolean };
