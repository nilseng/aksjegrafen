import { IDatabase } from "../database/mongoDB";

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
