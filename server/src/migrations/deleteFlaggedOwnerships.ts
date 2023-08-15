import { IDatabase } from "../database/mongoDB";

export const deleteFlaggedOwnerships = async (db: IDatabase) => {
  const res = await db.ownerships.deleteMany({ deleted: true });
  console.log(`Deleted ${res.deletedCount} ownership documents`);
};
