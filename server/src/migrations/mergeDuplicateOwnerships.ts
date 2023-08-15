import { IDatabase } from "../database/mongoDB";

export const mergeDuplicateOwnerships = async (db: IDatabase) => {
  let count = 0;
  console.log(`skipping ${count} items`);
  const ownerships = db.ownerships.find({}).sort({ _id: -1 }).skip(count);
  console.log("ownerships sorted and fetched");
  for await (const ownership of ownerships) {
    count = count + 1;
    console.log(count);
    const dups = await db.ownerships
      .find({
        orgnr: ownership.orgnr,
        shareHolderId: ownership.shareHolderId,
      })
      .sort({ year: -1, _id: -1 })
      .toArray();
    const firstId = dups[0]._id;
    const ids = dups.map((o) => o._id).filter((_id) => _id !== firstId);
    await db.ownerships.updateMany({ _id: { $in: ids } }, { $set: { deleted: true } });
  }
};
