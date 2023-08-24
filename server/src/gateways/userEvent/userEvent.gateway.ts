import { Database } from "../../database/databaseSetup";
import { UserEvent, isUserEvent } from "../../models/models";

const client = () => Database.getInstance().db.userEvents;

export const saveUserEvent = async (event: UserEvent) => {
  if (!isUserEvent(event)) throw Error("Invalid User Event");
  await client().insertOne(event);
};

export const getEventCountByUuid = (): Promise<{ uuid: string; count: number }[]> => {
  return client()
    .aggregate<{ uuid: string; count: number }>([
      {
        $group: {
          _id: "$uuid",
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
          uuid: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();
};
