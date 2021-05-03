export interface OwnershipRaw {
    Orgnr: string
    Selskap: string
    Aksjeklasse: string
    'Navn aksjonær': string
    'Fødselsår/orgnr': string | undefined
    'Postnr/sted': string | undefined
    Landkode: string
    'Antall aksjer': string | number
    'Antall aksjer selskap': string | number
}

export interface Ownership {
    orgnr: string
    shareHolderId: string
    shareClass: string
    stocks: number
    company?: Company
    shareholder?: Shareholder
}

export type Shareholder = Company & Person & { id: string, kind: ShareholderType }

export enum ShareholderType {
    COMPANY,
    PERSON,
    UNKNOWN
}

export interface Company {
    orgnr?: string
    name: string
    zipCode?: string
    location?: string
    countryCode?: string
    stocks?: number
}

export interface Person {
    name: string
    yearOfBirth?: number
    zipCode?: string
    location?: string
    countryCode?: string
}
