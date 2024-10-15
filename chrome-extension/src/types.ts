import { User } from 'firebase/auth'

export type OriginalPortalCellRowData = {
  title: string
  company: string
  location: string
  sustainabilityLabel: string
  number: string
  format: string
  registered: string
  positions: string
  professor: string
  creationDate: string
}

export type FormattedPortalCellRowData = Omit<
  OriginalPortalCellRowData,
  'format' | 'professor' | 'registered' | 'positions'
> & {
  format: Format[]
  professor: string | null
  registered: number
  positions: number
}

export type Location = {
  city: string
  country: string | null
}

export type Format = 'internship' | 'project'

export type PageData = {
  length: string
  hiringTime: string
  salary: string
  benefits: string
  description: string
  requiredSkills: string
  remarks: string
  languages: {
    french: string
    english: string
    german: string
  }
  relatedMasters: string[]
  companyInfo: {
    name: string
    address: {
      street: string
      city: string
      country: string
    }
    website: string
  }
  contactInfo: {
    name: string
    title: string
    email: string
    cellPhone: string
    professionalPhone: string
  }
  file: {
    detailId: string
    fileName: string
  } | null
}

// Omit location and salary from Offer
export type OfferToBeFormatted = Omit<Offer, 'location' | 'salary'> & {
  location: string
  salary: string
}

export type Offer = {
  id: string
  title: string
  company: string
  location: Location[]
  salary: string | number | null
  sustainabilityLabel: string
  number: string
  format: Format[]
  registered: number
  positions: number
  professor: string | null
  creationDate: string
} & Omit<PageData, 'salary'>

export type UserData = {
  hasReferredSomeone: boolean
  referredAt: number | null
  affiliateCode: string
}

export type UserWithData = User &
  UserData & {
    hasFiltersUnlocked: boolean
  }

export type JobOffers = {
  offers: Offer[]
  lastUpdated: number
}

export type DisplayMode = 'list' | 'table'
