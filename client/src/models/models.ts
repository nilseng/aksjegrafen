export interface Company {
    _id: string;
    orgnr?: string;
    name: string;
    zipCode?: string;
    location?: string;
    countryCode?: string;
    stocks?: number;
}

export type Shareholder = Company &
    Person & { _id: string; id: string; kind: ShareholderType };

enum ShareholderType {
    COMPANY,
    PERSON,
    UNKNOWN,
}

export interface Company {
    orgnr?: string;
    name: string;
    zipCode?: string;
    location?: string;
    countryCode?: string;
    stocks?: number;
}

export interface Person {
    name: string;
    yearOfBirth?: number;
    zipCode?: string;
    location?: string;
    countryCode?: string;
}