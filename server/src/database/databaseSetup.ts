import db, { Collection } from "mongodb";
import { Company, Ownership, Shareholder } from "../models/models";

export interface IDatabase {
  ownerships: Collection<Ownership>;
  shareholders: Collection<Shareholder>;
  companies: Collection<Company>;
};

export class Database {
  private static _db: IDatabase;
  static instance: Database;

  public static async initialize(): Promise<IDatabase> {
    if (!Database.instance) Database.instance = new Database()
    Database._db = await connectToMongoDb();
    return this._db;
  }

  public static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database()
    return Database.instance;
  }

  get db() {
    return Database._db;
  }
}

const connectToMongoDb = async (): Promise<IDatabase> => {
  const db_uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!db_uri) {
    throw Error('Could not find a database URI')
  }

  const client = await db.MongoClient.connect(db_uri, {
    useUnifiedTopology: true,
  });

  console.log(
    `Mongoclient connected to database server:${client.isConnected()}`
  );

  // Retrieving mongodb collections
  const collections = {
    ownerships: client.db().collection<Ownership>('ownerships'),
    shareholders: client.db().collection<Shareholder>('shareholders'),
    companies: client.db().collection<Company>('companies')
  }

  //Creating indices
  /* await collections.shareholders.dropIndexes();
  await collections.shareholders.createIndex({ id: 1 }, { unique: true });
  await collections.shareholders.createIndex({ name: 1 });
  await collections.shareholders.createIndex({ orgnr: 1 });
  await collections.companies.createIndex({ orgnr: 1 }, { unique: true });
  await collections.companies.createIndex({ name: 1 });
  await collections.ownerships.dropIndexes();
  await collections.ownerships.createIndex({ shareholderOrgnr: 1 });
  await collections.ownerships.createIndex({ orgnr: 1, year: 1 });
  await collections.ownerships.createIndex({ stocks: -1 });
  await collections.ownerships.createIndex({ shareHolderId: 1, year: 1 }); */

  //Connection events
  client.on("error", (err) => {
    console.log("Mongoclient connection error: " + err);
  });
  client.on("disconnected", () => {
    console.log("Mongoclient disconnected");
  });

  //Capture app termination/restart events
  //To be called when process is restarted or terminated
  const gracefulShutdown = (msg: string, callback: any) => {
    client.close(() => {
      console.log("Mongo client disconnected through " + msg);
      callback();
    });
  };

  //For app termination
  process.on("SIGINT", () => {
    gracefulShutdown("app termination", () => {
      process.exit(0);
    });
  });
  //For Heroku app termination
  process.on("SIGTERM", () => {
    gracefulShutdown("Heroku app termination", () => {
      process.exit(0);
    });
  });

  return collections;
};