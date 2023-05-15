import { IDatabase } from "../database/databaseSetup";

export const deleteOwnershipsWoId = async (db: IDatabase) => {
  const res = await db.ownerships.deleteMany({ shareHolderId: { $exists: false } });
  console.log("Deleted", res.deletedCount, "ownerships wo shareHolderId");
};
