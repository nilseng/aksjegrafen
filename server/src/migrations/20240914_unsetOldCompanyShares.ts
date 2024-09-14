import { AnyBulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/mongoDB";
import { Company } from "../models/models";

const limit = 100_000;

export const unsetOldCompanyShares = async (db: IDatabase) => {
  console.log(`*** Unsetting old holdings. ***`);

  const companyCount = await db.companies.countDocuments({});

  for (let skip = 0; skip < companyCount; skip = skip + limit) {
    const companies = await db.companies.find({}).skip(skip).limit(limit).toArray();
    const ops: AnyBulkWriteOperation<Company>[] = [];
    ops.push({
      updateMany: {
        filter: { _id: { $in: companies.map((o) => o._id) } },
        update: {
          $unset: {
            "shares.2014": "",
            "shares.2013": "",
            "shares.2012": "",
            "shares.2011": "",
            "shares.2010": "",
            "shares.2009": "",
          },
        },
      },
    });
    const res = await db.companies.bulkWrite(ops);
    console.log(`*** Modified ${res.modifiedCount} companies. ***`);
  }
};
