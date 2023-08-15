import { IDatabase } from "../database/mongoDB";

export const deleteOwnershipsWoId = async (db: IDatabase) => {
  const res = await db.ownerships.deleteMany({ shareHolderId: { $exists: false } });
  console.log("Deleted", res.deletedCount, "ownerships wo shareHolderId");
};
