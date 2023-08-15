import { Database } from "../../database/databaseSetup";
import { UserEvent, isUserEvent } from "../../models/models";

const client = () => Database.getInstance().db.userEvents;

export const saveUserEvent = async (event: UserEvent) => {
  if (!isUserEvent(event)) throw Error("Invalid User Event");
  await client().insertOne(event);
};
