export interface ICompany {
    _id: string;
    orgnr?: string;
    name: string;
    zipCode?: string;
    location?: string;
    countryCode?: string;
    stocks?: number;
}

export type IShareholder = ICompany &
    IPerson & { _id: string; id: string; kind: ShareholderType };

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

export interface IOwnership {
    _id: string
    orgnr: string
    shareHolderId: string
    shareholderOrgnr?: string
    shareClass: string
    stocks: number
    year: 2019 | 2020
    company?: ICompany
    shareholder?: IShareholder
}

export interface GraphNodeEntity {
    company?: ICompany;
    shareholder?: IShareholder;
}