import { IDatabase } from "../database/databaseSetup";
import { Ownership } from "../models/models";

export const countHoldingsByYear = async (db: IDatabase) => {
  await db.ownerships.updateMany({}, { $unset: { holdings: "" } });
  console.info("cleared all holdings");
  const ownerships = db.ownerships.find({});
  await ownerships.forEach((o: Ownership) => {
    db.ownerships.updateMany(
      {
        orgnr: o.orgnr,
        shareHolderId: o.shareHolderId,
      },
      {
        $inc: {
          [`holdings.${o.year}.${o.shareClass}`]: o.stocks,
        },
      }
    );
  });
  console.info("Count of holdings by year completed.");
};
