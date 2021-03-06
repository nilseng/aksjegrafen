export type Year = 2021 | 2020 | 2019;

export interface ICompany {
  _id: string;
  orgnr?: string;
  name: string;
  zipCode?: string;
  location?: string;
  countryCode?: string;
  stocks?: number;
  investorCount?: {
    2021?: number;
    2020?: number;
    2019?: number;
  };
  investmentCount?: {
    2021?: number;
    2020?: number;
    2019?: number;
  };
}

export const isCompany = (o: any): o is ICompany => {
  return (
    !isOwnership(o) &&
    !isShareholder(o) &&
    o._id &&
    typeof o._id === "string" &&
    (!o.orgnr || typeof o.orgnr === "string") &&
    o.name &&
    typeof o.name === "string" &&
    (!o.zipCode || typeof o.zipCode === "string") &&
    (!o.location || typeof o.location === "string") &&
    (!o.countryCode || typeof o.countryCode === "string") &&
    (!o.stocks || typeof o.stocks === "number")
  );
};

export type IShareholder = ICompany & IPerson & { _id: string; id: string; kind: ShareholderType };

export const isShareholder = (o: any): o is IShareholder => {
  return (
    o._id &&
    typeof o._id === "string" &&
    o.id &&
    typeof o.id === "string" &&
    (!o.orgnr || typeof o.orgnr === "string") &&
    o.name &&
    typeof o.name === "string" &&
    (!o.zipCode || typeof o.zipCode === "string") &&
    (!o.location || typeof o.location === "string") &&
    (!o.countryCode || typeof o.countryCode === "string") &&
    (!o.stocks || typeof o.stocks === "number") &&
    (o.kind === 0 || o.kind === 1 || o.kind === 2) &&
    isPerson(o)
  );
};

enum ShareholderType {
  COMPANY,
  PERSON,
  UNKNOWN,
}

export interface IPerson {
  name: string;
  yearOfBirth?: number;
  zipCode?: string;
  location?: string;
  countryCode?: string;
}

const isPerson = (o: any): o is IPerson => {
  return (
    o.name &&
    typeof o.name === "string" &&
    (!o.yearOfBirth || typeof o.yearOfBirth === "string" || typeof o.yearOfBirth === "number") &&
    (!o.zipCode || typeof o.zipCode === "string") &&
    (!o.location || typeof o.location === "string") &&
    (!o.countryCode || typeof o.countryCode === "string")
  );
};

export interface IOwnership {
  _id: string;
  orgnr: string;
  shareHolderId: string;
  shareholderOrgnr?: string;
  shareClass: string;
  stocks: number;
  year: Year;
  company?: ICompany;
  shareholder?: IShareholder;
  companyStocks: string | number;
  shareholderStocks: string | number;
}

export const isOwnership = (o: any): o is IOwnership => {
  return (
    o &&
    o._id &&
    typeof o._id === "string" &&
    o.orgnr &&
    typeof o.orgnr === "string" &&
    o.shareHolderId &&
    typeof o.shareHolderId === "string" &&
    (!o.shareholderOrgnr || typeof o.shareholderOrgnr === "string") &&
    o.shareClass &&
    typeof o.shareClass === "string" &&
    o.stocks &&
    typeof o.stocks === "number" &&
    o.year &&
    typeof o.year === "number" &&
    (o.year === 2019 || o.year === 2020 || o.year === 2021) &&
    (!o.company || isCompany(o.company)) &&
    (!o.shareholder || isShareholder(o.shareholder))
  );
};
