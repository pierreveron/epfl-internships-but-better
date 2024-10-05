from typing import Optional, TypedDict


class Address(TypedDict):
    street: str
    city: str
    country: str


class CompanyInfo(TypedDict):
    name: str
    address: Address
    website: str


class ContactInfo(TypedDict):
    name: str
    title: str
    email: str
    cellPhone: str
    professionalPhone: str


class File(TypedDict):
    detailId: str
    fileName: str


class Languages(TypedDict):
    french: str
    english: str
    german: str


class PageData(TypedDict):
    length: str
    hiringTime: str
    salary: str
    benefits: str
    description: str
    requiredSkills: str
    remarks: str
    languages: Languages
    relatedMasters: list[str]
    companyInfo: CompanyInfo
    contactInfo: ContactInfo
    file: Optional[File]
