import { AnyBulkWriteOperation } from "mongodb";
import { availableYears } from "../config";
import { IDatabase } from "../database/databaseSetup";
import { Company, Ownership } from "../models/models";

export const countCompanySharesByYear = async (db: IDatabase) => {
  const companyCount = await db.companies.countDocuments();
  const limit = 10_000;
  for (let skip = 0; skip < companyCount; skip += limit) {
    console.info(`skips ${skip} companies`);
    const companies = await db.companies.find({}).skip(skip).limit(limit).toArray();
    console.info(`Found ${companies.length} companies`);
    const bulkWriteOps: AnyBulkWriteOperation<Company>[] = [];
    await Promise.all(
      companies.map(async (company, i) => {
        await Promise.all(
          availableYears.map(async (year) => {
            const ownership = await db.ownerships.findOne({ orgnr: company.orgnr, year });
            if (ownership) {
              bulkWriteOps.push({
                updateOne: {
                  filter: { _id: company._id },
                  update: {
                    $set: {
                      [`shares.${year}.total`]: +(ownership as Ownership & { companyStocks: number }).companyStocks,
                    },
                  },
                },
              });
            }
          })
        );
        console.info(`Update operations defined for company with index ${skip + i}`);
      })
    );
    await db.companies.bulkWrite(bulkWriteOps);
    console.info(`Updated ${companies.length} companies.`);
  }
  console.info("Count of company shares by year completed.");
};
