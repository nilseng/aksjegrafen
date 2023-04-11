import { IDatabase } from "../database/databaseSetup";
import { Ownership } from "../models/models";

export const countHoldingsByYear = async (db: IDatabase) => {
  await db.ownerships.updateMany({ holdings: { $exists: true } }, { $unset: { holdings: "" } });
  const ownerships = db.ownerships.find({});
  await ownerships.forEach((o: Ownership) => {
    db.ownerships.updateMany(
      {
        orgnr: o.orgnr,
        $or: [
          {
            $and: [
              { shareholderOrgnr: { $exists: true } },
              { shareholderOrgnr: { $ne: null } },
              { shareholderOrgnr: o.shareholderOrgnr },
            ],
          },
          { shareHolderId: o.shareHolderId },
        ],
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
