import { IDatabase } from "../database/mongoDB";
import { Year } from "../models/models";

export const transformData = async (db: IDatabase, year: Year) => {
  console.log("Data transformation started.");
  await writeInvestorCount(db, year);
  await writeInvestmentCount(db, year);
  console.log("Data transformation complete.");
};

const writeInvestorCount = async (db: IDatabase, year: Year) => {
  console.log("writeInvestorCount started.");
  const investorCounts: { [orgnr: string]: number } = {};
  const ownerships = await db.ownerships.find({ [`holdings.${year}.total`]: { $gt: 0 } }).toArray();
  for (const ownership of ownerships) {
    if (!investorCounts[ownership.orgnr]) investorCounts[ownership.orgnr] = 1;
    else investorCounts[ownership.orgnr] += 1;
  }

  await db.companies.bulkWrite(
    Object.keys(investorCounts).map((orgnr) => ({
      updateOne: {
        filter: { orgnr },
        update: { $set: { [`investorCount.${year}`]: investorCounts[orgnr] } },
      },
    }))
  );
  console.log("writeInvestorCount complete.");
};

const writeInvestmentCount = async (db: IDatabase, year: Year) => {
  console.log("writeInvestmentCount started.");
  const ownerships = await db.ownerships.find({ [`holdings.${year}.total`]: { $gt: 0 } }).toArray();
  const shareholderInvestments: { [id: string]: number } = {};
  const companyInvestments: { [orgnr: string]: number } = {};

  for (const ownership of ownerships) {
    if (!shareholderInvestments[ownership.shareHolderId]) shareholderInvestments[ownership.shareHolderId] = 1;
    else shareholderInvestments[ownership.shareHolderId] += 1;

    if (ownership.shareholderOrgnr) {
      if (!companyInvestments[ownership.shareholderOrgnr]) companyInvestments[ownership.shareholderOrgnr] = 1;
      else companyInvestments[ownership.shareholderOrgnr] += 1;
    }
  }
  console.log("starting shareholder bulk write.");
  await db.shareholders.bulkWrite(
    Object.keys(shareholderInvestments).map((id) => ({
      updateOne: {
        filter: { id },
        update: { $set: { [`investmentCount.${year}`]: shareholderInvestments[id] } },
      },
    }))
  );
  console.log("shareholder bulk write complete.");

  console.log("starting company bulk write.");
  await db.companies.bulkWrite(
    Object.keys(companyInvestments).map((orgnr) => ({
      updateOne: {
        filter: { orgnr },
        update: { $set: { [`investmentCount.${year}`]: companyInvestments[orgnr] } },
      },
    }))
  );
  console.log("company bulk write complete.");

  console.log("writeInvestmentCount complete.");
};
