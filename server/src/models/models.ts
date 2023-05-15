import { ObjectId } from "mongodb";

export type Year = 2022 | 2021 | 2020 | 2019;

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

export interface Ownership {
  _id?: ObjectId;
  orgnr: string;
  shareHolderId: string;
  shareholderOrgnr?: string | null;
  investor?: { company?: Company; shareholder?: Shareholder };
  investment?: Company | null;
  holdings: {
    [year in Year]?: {
      total: number;
      [stockClass: string]: number;
    };
  };
}

export type Shareholder = Partial<Company> & Partial<Person> & { id: string; kind: ShareholderType; name?: string };

export enum ShareholderType {
  COMPANY,
  PERSON,
  UNKNOWN,
}

export interface Company {
  _id?: ObjectId;
  orgnr: string;
  name: string;
  zipCode?: string;
  location?: string;
  countryCode?: string;
  shares?: { [key in Year]?: { total: number } };
  investorCount?: { [key in Year]?: number };
  investmentCount?: { [key in Year]?: number };
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

export interface Role {
  type: string;
  orgnr: string;
  holder: {
    person?: {
      birthDate?: string;
      fornavn?: string;
      etternavn?: string;
    };
    unit?: {
      orgnr: string;
      organisasjonsform: string;
      navn: string;
    } & Partial<Company>;
  };
  company?: Company;
  shareholder?: Shareholder;
}

export type Relation =
  | { role: Role; ownership?: never }
  | { role?: never; ownership: Pick<Ownership, "shareholderOrgnr" | "orgnr" | "holdings" | "investor" | "investment"> };

export const isOwnership = (o: any): o is Ownership => {
  return o.orgnr && typeof o.orgnr === "string" && o.shareHolderId && typeof o.shareHolderId === "string" && o.holdings;
};

export const isShareholder = (o: any): o is Shareholder => {
  return o.id && typeof o.id === "string" && (o.kind || o.kind === 0);
};

export const isCompany = (o: any): o is Company => {
  return o.orgnr && typeof o.orgnr === "string" && o.name && typeof o.name === "string";
};
