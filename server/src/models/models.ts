import { ObjectID } from "mongodb";

export type Year = 2021 | 2020 | 2019;

export interface OwnershipRaw {
  orgnr: string;
  companyName: string;
  shareClass: string;
  shareholderName: string;
  yobOrOrgnr: string | undefined;
  zipLocation: string | undefined;
  countryCode: string;
  shareholderStocks: string | number;
  companyStocks: string | number;
}

export type Ownership = OwnershipRaw & {
  shareHolderId: string;
  shareholderOrgnr?: string | null;
  stocks: number;
  year: number;
  company?: Company;
  shareholder?: Shareholder;
  holdings?: {
    [year in Year]?: {
      [stockClass: string]: { stocks: number };
    };
  };
};

export type Shareholder = Partial<Company> & Partial<Person> & { id: string; kind: ShareholderType; name: string };

export enum ShareholderType {
  COMPANY,
  PERSON,
  UNKNOWN,
}

export interface Company {
  _id: ObjectID;
  orgnr: string;
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

export interface Person {
  name: string;
  yearOfBirth?: number;
  zipCode?: string;
  location?: string;
  countryCode?: string;
}

export interface BusinessCode {
  code: string;
  parentCode: string;
  level: number;
  name: string;
  shortName: string;
  notes: string;
}

export const isOwnership = (o: any): o is Ownership => {
  return (
    o.orgnr &&
    typeof o.orgnr === "string" &&
    o.shareHolderId &&
    typeof o.shareHolderId === "string" &&
    o.shareClass &&
    typeof o.shareClass === "string" &&
    o.stocks &&
    typeof +o.stocks === "number" &&
    o.year &&
    typeof +o.year === "number"
  );
};

export const isShareholder = (o: any): o is Shareholder => {
  return o.id && typeof o.id === "string" && (o.kind || o.kind === 0) && (o.name || o.orgnr);
};

export const isCompany = (o: any): o is Company => {
  return o.orgnr && typeof o.orgnr === "string" && o.name && typeof o.name === "string";
};
