import csv from 'csv-parser'
import path from 'path'
import fs from 'fs'

import { collections as db } from "../database/databaseSetup"

interface OwnershipRaw {
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

interface Ownership {
    orgnr: string
    shareHolderId: string
    shareClass: string
    stocks: number
}

type Shareholder = Company & Person & { id: string, kind: ShareholderType }

enum ShareholderType {
    COMPANY,
    PERSON,
    UNKNOWN
}

interface Company {
    orgnr?: string
    name: string
    zipCode?: string
    location?: string
    countryCode?: string
    stocks?: number
}

interface Person {
    name: string
    yearOfBirth?: number
    zipCode?: string
    location?: string
    countryCode?: string
}

export const importData = async () => {
    console.log('------------- Data import started -------------')
    const ownerships: Ownership[] = []
    const companies: { [key: string]: Company } = {}
    const shareholders: { [key: string]: Shareholder } = {}
    let counter = 0;
    const stream = fs.createReadStream(path.join(__dirname, '../../..', 'data', 'aksjeeiebok__2019_04052020.csv'))
        .pipe(csv({ separator: ';', strict: true, quote: undefined }))
        .on('data', async (raw: OwnershipRaw) => {

            if (Object.keys(raw).length !== 9) {
                console.log('Invalid record', raw)
                stream.destroy()
            } else {

                counter++
                if (counter % 100000 === 0) console.log(`-------------${counter} rows read -------------`)

                const ownership = mapOwnership(raw)
                ownerships.push(ownership)

                const company = { orgnr: raw['Orgnr'], name: raw['Selskap'], stocks: +raw['Antall aksjer selskap'] }
                companies[company.orgnr] = company

                const shareholder = mapShareholder(raw, ownership.shareHolderId)
                shareholders[shareholder.id] = shareholder
            }
        })
        .on('end', async () => {
            console.log('------------- Data transform complete -------------')
            console.log('------------- Sample data -------------')
            console.log('OWNERSHIP:', ownerships[0])
            console.log('COMPANY:', Object.values(companies)[0])
            console.log('SHAREHOLDER', Object.values(shareholders)[0])
            await db.ownerships.insertMany(ownerships)
            await db.companies.insertMany(Object.values(companies))
            await db.shareholders.insertMany(Object.values(shareholders))
            console.log('------------- Data import complete -------------')
        })
}

const mapOwnership = (raw: OwnershipRaw): Ownership => {
    return {
        orgnr: raw['Orgnr'], shareClass: raw['Aksjeklasse'], stocks: +raw['Antall aksjer'],
        shareHolderId: raw['Navn aksjonær'] + raw['Fødselsår/orgnr'] + raw['Postnr/sted'] + raw['Landkode']
    }
}

const mapShareholder = (raw: OwnershipRaw, id: string): Shareholder => {
    return {
        id,
        name: raw['Navn aksjonær'],
        orgnr: raw['Fødselsår/orgnr']?.length === 9 ? raw['Fødselsår/orgnr'] : undefined,
        yearOfBirth: raw['Fødselsår/orgnr']?.length === 4 ? +raw['Fødselsår/orgnr'] : undefined,
        zipCode: raw['Postnr/sted'] && raw['Postnr/sted'].length >= 4 ? raw['Postnr/sted'].substr(0, 4) : undefined,
        location: raw['Postnr/sted'] && raw['Postnr/sted'].length > 5 ? raw['Postnr/sted'].substr(5) : undefined,
        countryCode: raw['Landkode'],
        kind: getShareholderType(raw)
    }
}

const getShareholderType = (raw: OwnershipRaw): ShareholderType => {
    return raw['Fødselsår/orgnr']?.length === 9 ? ShareholderType.COMPANY : (raw['Fødselsår/orgnr']?.length === 4 ? ShareholderType.PERSON : ShareholderType.UNKNOWN)
}