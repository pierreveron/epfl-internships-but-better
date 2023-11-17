export type OriginalPortalCellRowData = {
  title: string;
  company: string;
  location: string;
  // sustainabilityLabel: string
  number: string;
  format: string;
  registered: string;
  positions: string;
  professor: string;
  creationDate: string;
};

export type FormattedPortalCellRowData = {
  title: string;
  company: string;
  location: string;
  number: string;
  format: Format[];
  registered: number;
  positions: number;
  professor: string | null;
  creationDate: string;
};

export type Location = {
  city: string;
  country: string | null;
};

export type Format = "internship" | "project";

export type PageData = {
  length: string;
  hiringTime: string;
  salary: string;
  benefits: string;
  description: string;
  requiredSkills: string;
  remarks: string;
  languages: {
    french: string;
    english: string;
    german: string;
  };
  relatedMasters: string[];
};

// Omit location and salary from Offer
export type OfferToBeFormatted = Omit<Offer, "location" | "salary"> & {
  location: string;
  salary: string;
};

export type Offer = {
  id: string;
  title: string;
  company: string;
  location: Location[];
  salary: string | number | null;
  //   sustainabilityLabel: string
  number: string;
  format: Format[];
  registered: number;
  positions: number;
  professor: string | null;
  creationDate: string;
} & Omit<PageData, "salary">;
