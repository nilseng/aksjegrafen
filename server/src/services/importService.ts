import { IDatabase } from "../database/databaseSetup";
import { Year } from "../models/models";

export const importData = async (db: IDatabase, year?: Year, data?: (number | string)[]) => {
  //importShareholderRegistry(db, year, data);
  //importBusinessCodes(db);
  //importRoles(db);
};
