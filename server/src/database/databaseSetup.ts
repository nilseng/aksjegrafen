import { Collection } from "mongodb";
import { Driver } from "neo4j-driver";
import { BusinessCode, Company, Ownership, Role, Shareholder } from "../models/models";
import { graphDB } from "./graphDB";
import { connectToMongoDb } from "./mongoDB";

export interface IDatabase {
  ownerships: Collection<Ownership>;
  shareholders: Collection<Shareholder>;
  companies: Collection<Company>;
  roles: Collection<Role>;
  businessCodes: Collection<BusinessCode>;
}

export class Database {
  private static _db: IDatabase;
  private static _graphDB: Driver;
  static instance: Database;

  public static async initialize(): Promise<{ db: IDatabase; graphDB: Driver }> {
    if (!Database.instance) Database.instance = new Database();
    Database._db = await connectToMongoDb();
    Database._graphDB = graphDB;
    return { db: this._db, graphDB: this._graphDB };
  }

  public static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }

  get db() {
    return Database._db;
  }
}
