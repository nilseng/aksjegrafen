import { ObjectID } from "mongodb"
import { collections as db } from "../database/databaseSetup"

export const resolveData = async (dataIds: string[]) => {
    const data = await db.collectionName.find({ _id: { $in: dataIds.map(id => new ObjectID(id)) } }).toArray()
    return data
}