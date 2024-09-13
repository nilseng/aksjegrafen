import { AnyBulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/mongoDB";
import { Shareholder } from "../models/models";

const limit = 100_000;

export const deleteOldShareholders = async (db: IDatabase) => {
  console.log("*** Deleting shareholders without ownerships in DB ***");
  const shareholderCount = await db.shareholders.countDocuments({});
  console.log(`*** Counted ${shareholderCount} shareholders ***`);
  const ownerships = await db.ownerships.find({}).toArray();
  console.log(`*** Fetched ${ownerships.length} ownerships ***`);
  const ownershipMap: { [key: string]: true } = {};
  ownerships.forEach((o) => {
    ownershipMap[o.shareHolderId] = true;
  });
  let shareholdersToBeDeleted = 0;
  for (let skip = 0; skip < shareholderCount; skip += limit) {
    console.log(`* Skipping ${skip} shareholders *`);
    const shareholders = await db.shareholders.find({}).skip(skip).limit(limit).toArray();
    console.log(`* Fetched ${shareholders.length} shareholders *`);
    const ops: AnyBulkWriteOperation<Shareholder>[] = [];
    for (const s of shareholders) {
      if (!ownershipMap[s.id]) {
        ops.push({ updateOne: { filter: { _id: s._id }, update: { $set: { deleted: true } } } });
      }
    }
    if (ops.length) {
      const res = await db.shareholders.bulkWrite(ops);
      console.log(`* ${res.matchedCount} shareholders should be deleted *`);
      console.log(`* ${res.modifiedCount} shareholders were not marked to be deleted *`);
      shareholdersToBeDeleted += res.matchedCount;
    }
    console.log(`* ${shareholdersToBeDeleted} marked to be deleted so far *`);
  }
  console.log(`*** Migration complete. ${shareholdersToBeDeleted} shareholders marked for deletion. ****`);
};

export const deleteMarkedShareholders = async (db: IDatabase) => {
  console.log(`*** Deleting marked shareholders ***`);
  const res = await db.shareholders.deleteMany({ deleted: true });
  console.log(`*** ${res.deletedCount} shareholders were deleted. ***`);
};
