import { IDatabase } from "../database/mongoDB";

/* Deletes ownerships where there are no holdings after 2013. Also, deletes shareholder and companies with no ownerships
after 2013. */

const recentHoldings = [
  { "holdings.2015": { $exists: true } },
  { "holdings.2016": { $exists: true } },
  { "holdings.2017": { $exists: true } },
  { "holdings.2018": { $exists: true } },
  { "holdings.2019": { $exists: true } },
  { "holdings.2020": { $exists: true } },
  { "holdings.2021": { $exists: true } },
  { "holdings.2022": { $exists: true } },
  { "holdings.2023": { $exists: true } },
];

export const deleteOldOwnerships = async (db: IDatabase) => {
  const ownershipCount = await db.ownerships.countDocuments({});
  console.log(`*** Ownerships before deletion: ${ownershipCount} ***`);

  const oldOwnershipCount = await db.ownerships.countDocuments({ $nor: recentHoldings });
  console.log(`*** Old ownerships: ${oldOwnershipCount} ***`);
  console.log(`*** Ownerships to be deleted: ${((oldOwnershipCount / ownershipCount) * 100).toFixed(2)}% ***`);

  const deletedResult = await db.ownerships.deleteMany({ $nor: recentHoldings });
  console.log(`*** Documents deleted: ${deletedResult.deletedCount} ***`);

  const newOwnershipCount = await db.ownerships.countDocuments({});
  console.log(`*** Ownerships after deletion: ${newOwnershipCount} ***`);
};
