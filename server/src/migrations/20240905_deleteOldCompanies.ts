import { AnyBulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/mongoDB";
import { Company } from "../models/models";

const limit = 100_000;

export const deleteOldCompanies = async (db: IDatabase) => {
  console.log("*** Deleting companies without ownerships in DB ***");
  const companyCount = await db.companies.countDocuments({});
  console.log(`*** Counted ${companyCount} companies ***`);
  const ownerships = await db.ownerships.find({}).toArray();
  console.log(`*** Fetched ${ownerships.length} ownerships ***`);
  const ownershipMap: { [key: string]: true } = {};
  ownerships.forEach((o) => {
    ownershipMap[o.orgnr] = true;
  });
  let companiesToBeDeleted = 0;
  for (let skip = 0; skip < companyCount; skip += limit) {
    console.log(`* Skipping ${skip} companies *`);
    const companies = await db.companies.find({}).skip(skip).limit(limit).toArray();
    console.log(`* Fetched ${companies.length} companies *`);
    const ops: AnyBulkWriteOperation<Company>[] = [];
    for (const { orgnr, _id } of companies) {
      if (!ownershipMap[orgnr]) {
        ops.push({ updateOne: { filter: { _id }, update: { $set: { deleted: true } } } });
      }
    }
    if (ops.length) {
      const res = await db.companies.bulkWrite(ops);
      console.log(`* ${res.matchedCount} companies should be deleted *`);
      console.log(`* ${res.modifiedCount} companies were not marked to be deleted *`);
      companiesToBeDeleted += res.matchedCount;
    }
    console.log(`* ${companiesToBeDeleted} marked to be deleted so far *`);
  }
  console.log(`*** Migration complete. ${companiesToBeDeleted} companies marked for deletion. ****`);
};

export const deleteMarkedCompanies = async (db: IDatabase) => {
  console.log(`*** Deleting marked companies ***`);
  const res = await db.companies.deleteMany({ deleted: true });
  console.log(`*** ${res.deletedCount} companies were deleted. ***`);
};
