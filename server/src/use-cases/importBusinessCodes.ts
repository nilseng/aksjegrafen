import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { IDatabase } from "../database/databaseSetup";
import { BusinessCode } from "../models/models";

export const importBusinessCodes = async (db: IDatabase) => {
  console.info("Importing business codes");
  const fileName = "naeringskoder.csv";
  const headers = ["code", "parentCode", "level", "name", "shortName", "notes"];
  const businessCodes: BusinessCode[] = [];
  fs.createReadStream(path.join(__dirname, "../../..", "data", fileName))
    .pipe(
      csv({
        separator: ";",
        strict: true,
        headers,
        skipLines: 1,
        quote: '"',
      })
    )
    .on("data", (code: BusinessCode) => {
      businessCodes.push({ ...code, level: +code.level });
    })
    .on("end", async () => {
      await db.businessCodes.bulkWrite(
        businessCodes.map((c) => ({ updateOne: { filter: { code: c.code }, update: { $set: c }, upsert: true } }))
      );
      console.info("------------- Business code import complete -------------");
    });
};
