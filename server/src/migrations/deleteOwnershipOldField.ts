import { IDatabase } from "../database/databaseSetup";

export const deleteOwnershipOldField = async (db: IDatabase) => {
  const res = await db.ownerships.updateMany(
    {},
    {
      $unset: {
        old: "",
      },
    }
  );
  console.log(`Removed fields for ${res.modifiedCount}`);
};
