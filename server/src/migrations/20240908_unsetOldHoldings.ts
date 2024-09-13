import { AnyBulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/mongoDB";
import { Ownership } from "../models/models";

const limit = 100_000;

export const unsetOldHoldings = async (db: IDatabase) => {
  console.log(`*** Unsetting old holdings. ***`);

  const ownershipCount = await db.ownerships.countDocuments({});

  for (let skip = 0; skip < ownershipCount; skip = skip + limit) {
    const ownerships = await db.ownerships.find({}).skip(skip).limit(limit).toArray();
    const ops: AnyBulkWriteOperation<Ownership>[] = [];
    ops.push({
      updateMany: {
        filter: { _id: { $in: ownerships.map((o) => o._id) } },
        update: {
          $unset: {
            "holdings.2014": "",
            "holdings.2013": "",
            "holdings.2012": "",
            "holdings.2011": "",
            "holdings.2010": "",
            "holdings.2009": "",
          },
        },
      },
    });
    const res = await db.ownerships.bulkWrite(ops);
    console.log(`*** Modified ${res.modifiedCount} ownerships. ***`);
  }
};
