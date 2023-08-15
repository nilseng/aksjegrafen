import { AnyBulkWriteOperation } from "mongodb";
import { IDatabase } from "../database/mongoDB";
import { Ownership } from "../models/models";

export const countTotalStocksByYearByOwnership = async (db: IDatabase) => {
  const ownerships = await db.ownerships.find({}).toArray();
  const ops: AnyBulkWriteOperation<Ownership>[] = [];
  ownerships.forEach((o, i) => {
    ops.push({
      updateOne: {
        filter: { _id: o._id },
        update: {
          $set: {
            ["holdings.2021.total"]: Object.values(o.holdings?.[2021] ?? {}).reduce(
              (total, stocks) => total + stocks,
              0
            ),
            ["holdings.2020.total"]: Object.values(o.holdings?.[2020] ?? {}).reduce(
              (total, stocks) => total + stocks,
              0
            ),
            ["holdings.2019.total"]: Object.values(o.holdings?.[2019] ?? {}).reduce(
              (total, stocks) => total + stocks,
              0
            ),
          },
        },
      },
    });
    if (i % 10000) console.log(i);
  });
  const res = await db.ownerships.bulkWrite(ops);
  console.log(res.modifiedCount);
};
