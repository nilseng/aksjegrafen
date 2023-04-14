import { IDatabase } from "../database/databaseSetup";

export const deleteRedundantOwnershipFields = async (db: IDatabase) => {
  const res = await db.ownerships.updateMany(
    {},
    {
      $unset: {
        stocks: "",
        year: "",
        companyName: "",
        shareClass: "",
        shareholderName: "",
        yobOrOrgnr: "",
        zipLocation: "",
        countryCode: "",
        shareholderStocks: "",
        companyStocks: "",
      },
    }
  );
  console.log(`Removed fields for ${res.modifiedCount}`);
};
