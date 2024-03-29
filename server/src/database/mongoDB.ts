import { Collection, MongoClient } from "mongodb";
import { BusinessCode, Company, Ownership, Role, Shareholder, UserEvent } from "../models/models";

export interface IDatabase {
  ownerships: Collection<Ownership>;
  shareholders: Collection<Shareholder>;
  companies: Collection<Company>;
  roles: Collection<Role>;
  businessCodes: Collection<BusinessCode>;
  userEvents: Collection<UserEvent>;
}

export const connectToMongoDb = async (): Promise<IDatabase> => {
  const db_uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!db_uri) {
    throw Error("Could not find a database URI");
  }

  const client = await MongoClient.connect(db_uri);

  console.log(`Mongoclient connected to database server`);

  const collections = {
    ownerships: client.db().collection<Ownership>("ownerships"),
    shareholders: client.db().collection<Shareholder>("shareholders"),
    companies: client.db().collection<Company>("companies"),
    roles: client.db().collection<Role>("roles"),
    businessCodes: client.db().collection<BusinessCode>("businessCodes"),
    userEvents: client.db().collection<UserEvent>("user_events"),
  };

  /* await collections.shareholders.dropIndexes();
    await collections.shareholders.createIndex({ id: 1 }, { unique: true });
    await collections.shareholders.createIndex({ name: 1 });
    await collections.shareholders.createIndex({ orgnr: 1 });
    await collections.companies.createIndex({ orgnr: 1 }, { unique: true });
    await collections.companies.createIndex({ name: 1 });
    await collections.ownerships.dropIndexes();
    await collections.ownerships.createIndex({ shareholderOrgnr: 1 });
    await collections.ownerships.createIndex({ shareHolderId: 1 });
    await collections.ownerships.createIndex({ orgnr: 1, "holdings.2021.total": -1 });
  await collections.ownerships.createIndex({ orgnr: 1, "holdings.2022.total": -1 });*/

  //Connection events
  client.on("error", (err) => {
    console.log("Mongoclient connection error: " + err);
  });
  client.on("disconnected", () => {
    console.log("Mongoclient disconnected");
  });

  //Capture app termination/restart events
  //To be called when process is restarted or terminated
  const gracefulShutdown = async (msg: string, callback: any) => {
    await client.close();
    console.log("Mongo client disconnected through " + msg);
    callback();
  };

  //For app termination
  process.on("SIGINT", () => {
    gracefulShutdown("app termination", () => {
      // TODO: App termination should be handled elsewhere
      process.exit(0);
    });
  });
  //For Heroku app termination
  process.on("SIGTERM", () => {
    gracefulShutdown("Heroku app termination", () => {
      // TODO: App termination should be handled elsewhere
      process.exit(0);
    });
  });

  return collections;
};
