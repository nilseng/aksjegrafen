import { Driver as Neo4j } from "neo4j-driver";
import { IDatabase } from "../database/mongoDB";
import { Year } from "../models/models";

export const importData = async (graphDB: Neo4j, db: IDatabase, year?: Year, data?: (number | string)[]) => {
  //importShareholderRegistry(db, year, data);
  //await importShareholderRegistryToGraph({graphDB, mongoDB: db, year})
  //await generateGraphNodeUUIDs(graphDB);
  //importBusinessCodes(db);
  //importRoles(db);
};
