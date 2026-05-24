import { Database } from "../../database/databaseSetup";
import { UserEvent, isUserEvent } from "../../models/models";

const client = () => Database.getInstance().db.userEvents;

export const saveUserEvent = async (event: UserEvent) => {
  if (!isUserEvent(event)) throw Error("Invalid User Event");
  await client().insertOne(event);
};

export const getEventCountByOrgnr = (): Promise<{ orgnr: string; count: number }[]> => {
  return client()
    .aggregate<{ orgnr: string; count: number }>([
      {
        $match: { orgnr: { $nin: [null, ""] } },
      },
      {
        $group: {
          _id: "$orgnr",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          orgnr: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();
};
