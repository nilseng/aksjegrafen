import { AnyBulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/databaseSetup";
import { Ownership, Year } from "../models/models";

const getHoldingsByYear = (ownerships: Ownership[], year: Year) => {
  const holdings: Ownership["holdings"][Year] = {
    total: ownerships.reduce((tot, h) => tot + (h.holdings[year]?.total ?? 0), 0),
  };
  ownerships.forEach((o) => {
    Object.keys(o.holdings[year] ?? {})
      .filter((key) => key !== "total")
      .forEach((key) => {
        if (holdings[key] && o.holdings[year]?.[key]) holdings[key] += o.holdings[year]?.[key] ?? 0;
        holdings[key] = o.holdings[year]?.[key] ?? 0;
      });
  });
  return holdings;
};

export const countHoldingsByShareholderOrgnr = async (db: IDatabase) => {
  const ownerships = await db.ownerships.find({ shareholderOrgnr: { $exists: true, $ne: null } }).toArray();
  const groups: { [key: string]: Ownership[] } = {};
  ownerships.forEach((o) => {
    groups[`${o.shareholderOrgnr}-${o.orgnr}`] = [...(groups[`${o.shareholderOrgnr}-${o.orgnr}`] ?? []), o];
  });
  const dups: { [key: string]: Ownership[] } = {};
  Object.keys(groups).forEach((key) => {
    if (groups[key].length > 1) dups[key] = groups[key];
  });
  const merged: { [key: string]: Omit<Ownership, "_id"> } = {};
  Object.keys(dups).forEach((key) => {
    const sorted = dups[key].sort((a, b) => (a.holdings?.[2021] ? -1 : 1));
    const holdings: Ownership["holdings"] = {
      2021: getHoldingsByYear(sorted, 2021),
      2020: getHoldingsByYear(sorted, 2020),
      2019: getHoldingsByYear(sorted, 2019),
    };
    merged[key] = {
      orgnr: sorted[0].orgnr,
      shareHolderId: sorted[0].shareHolderId,
      shareholderOrgnr: sorted[0].shareholderOrgnr,
      holdings,
    };
  });
  const ops: AnyBulkWriteOperation<Ownership>[] = [];
  Object.keys(dups).map((key) => {
    dups[key].forEach((dup) => {
      ops.push({ updateOne: { filter: { _id: dup._id }, update: { $set: { ...merged[key], old: dup } } } });
    });
  });
  const res = await db.ownerships.bulkWrite(ops);
  console.log(res.matchedCount);
  console.log(res.modifiedCount);
};
