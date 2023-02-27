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
};

export type Location = {
  city: string;
  country: string;
};

export type SelectableCity = { name: string; selected: boolean };
