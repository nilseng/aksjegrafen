import { BulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/databaseSetup";
import { Ownership } from "../models/models";

export const mergeDuplicateOwnershipsByShareholderOrgnr = async (db: IDatabase) => {
  const ownerships = await db.ownerships
    .find({ shareholderOrgnr: { $exists: true, $ne: null }, old: { $exists: true } })
    .toArray();
  console.log(`Found ${ownerships.length} dups`);
  const ops: BulkWriteOperation<Ownership>[] = [];
  ownerships.forEach(async (ownership) => {
    const dups = ownerships.filter(
      (o) => o.orgnr === ownership.orgnr && o.shareholderOrgnr === ownership.shareholderOrgnr
    );
    const firstId = dups[0]._id;
    const ids = dups.map((o) => o._id).filter((_id) => _id !== firstId);
    ops.push({ updateMany: { filter: { _id: { $in: ids } }, update: { $set: { deleted: true } } } });
  });
  const res = await db.ownerships.bulkWrite(ops);
  console.log(res.matchedCount);
  console.log(res.modifiedCount);
};
