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
  country: string;
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

export type OfferWithLocationToBeFormatted = Omit<Offer, "location"> & {
  location: string;
};

export type Offer = {
  id: string;

  title: string;
  company: string;
  location: Location[];
  //   sustainabilityLabel: string
  number: string;
  format: Format[];
  registered: number;
  positions: number;
  professor: string | null;
  creationDate: string;
} & PageData;
