import csv from 'csv-parser'
import path from 'path'
import fs from 'fs'

import { collections as db } from "../database/databaseSetup"

interface OwnerShip {
    Orgnr: string
    Selskap: string
    Aksjeklasse: string
    'Navn aksjonær': string | undefined
    'Fødselsår/orgnr': string | undefined
    'Postnr/sted': string | undefined
    Landkode: string
    'Antall aksjer': string | number
    'Antall aksjer selskap': string | number
}

export const importData = async () => {
    const data: OwnerShip[] = []
    fs.createReadStream(path.join(__dirname, '../../..', 'data', 'aksjeeiebok__2019_04052020.csv'))
        .pipe(csv({ separator: ';' }))
        .on('data', async (ownership: OwnerShip) => {
            ownership["Antall aksjer"] = +ownership["Antall aksjer"]
            ownership["Antall aksjer selskap"] = +ownership["Antall aksjer selskap"]
            if (('' + ownership["Fødselsår/orgnr"]).length === 9) {
                data.push(ownership)
            }
            else {
                ownership["Navn aksjonær"] = undefined
                ownership["Fødselsår/orgnr"] = undefined
                ownership["Postnr/sted"] = undefined
                data.push(ownership)
            }
        })
        .on('end', async () => {
            await db.shareownership.insertMany(data)
            console.log('ownership data imported')
        })
}