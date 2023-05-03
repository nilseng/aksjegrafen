import { IDatabase } from "../database/mongoDB";
import { Year } from "../models/models";

export const importData = async (db: IDatabase, year?: Year, data?: (number | string)[]) => {
  //importShareholderRegistry(db, year, data);
  //importBusinessCodes(db);
  //importRoles(db);
};
