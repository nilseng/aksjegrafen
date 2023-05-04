import { AnyBulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/databaseSetup";
import { Shareholder } from "../models/models";

export const deleteOldShareholders = async (db: IDatabase) => {
  const shareholders = await db.shareholders.find({}).toArray();
  const ownerships = await db.ownerships.find({}).toArray();
  const ownershipMap: { [key: string]: true } = {};
  ownerships.forEach((o) => {
    ownershipMap[o.shareHolderId] = true;
  });
  const ops: AnyBulkWriteOperation<Shareholder>[] = [];
  for (const s of shareholders) {
    if (!ownershipMap[s.id]) ops.push({ updateOne: { filter: { _id: s._id }, update: { $set: { deleted: true } } } });
  }
  const res = await db.shareholders.bulkWrite(ops);
  console.log(res.matchedCount);
  console.log(res.modifiedCount);
};
