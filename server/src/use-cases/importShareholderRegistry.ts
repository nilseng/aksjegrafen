import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { IDatabase } from "../database/mongoDB";
import {
  Company,
  isCompany,
  isOwnership,
  isShareholder,
  Ownership,
  OwnershipRaw,
  Shareholder,
  ShareholderType,
  Year,
} from "../models/models";

export const importShareholderRegistry = async (db: IDatabase, year?: Year, data?: (number | string)[]) => {
  console.log("Importing", data);
  let fileName: string;
  const headers = [
    "orgnr",
    "companyName",
    "shareClass",
    "shareholderName",
    "yobOrOrgnr",
    "zipLocation",
    "countryCode",
    "shareholderStocks",
    "companyStocks",
  ];
  switch (year) {
    case 2019: {
      fileName = "aksjeeiebok__2019_04052020.csv";
      break;
    }
    case 2020: {
      fileName = "aksjeeiebok__2020.csv";
      break;
    }
    case 2021: {
      fileName = "aksjeeiebok__2021.csv";
      break;
    }
    case 2022: {
      fileName = "aksjeeiebok__2022.csv";
      break;
    }
    default: {
      console.log("-------------");
      console.log("Specify for which year you want to import data (2019, 2020, 2021 or 2022)");
      console.log("-------------");
      return;
    }
  }
  console.log("------------- Data import started -------------");
  const ownerships: { [key: string]: Ownership } = {};
  const companies: { [key: string]: Company } = {};
  const shareholders: { [key: string]: Shareholder } = {};
  let counter = 0;
  const stream = fs
    .createReadStream(path.join(__dirname, "../../..", "data", fileName))
    .pipe(
      csv({
        separator: ";",
        strict: true,
        headers,
        skipLines: 1,
        quote: undefined,
      })
    )
    .on("data", (raw: OwnershipRaw) => {
      if (Object.keys(raw).length !== 9) {
        console.log("Invalid record", raw);
        stream.destroy();
      } else {
        counter++;
        if (counter % 100000 === 0) console.log(`-------------${counter} rows read -------------`);

        const ownership = mapOwnership(raw, year);
        const key = `${ownership.shareholderOrgnr ?? ownership.shareHolderId}-${ownership.orgnr}`;
        if (isOwnership(ownership)) {
          if (ownerships[key]) {
            // TODO: Handle the case where there are multiple entries of the same stock class. Now writing over dups instead of summarizing.
            ownerships[key].holdings[year] = {
              ...ownerships[key].holdings[year],
              ...ownership.holdings[year],
              total: ownerships[key].holdings[year]?.total! + ownership.holdings[year]?.total!,
            };
          } else ownerships[key] = ownership;
        } else console.log("Invalid ownership", ownership, raw);

        const company = mapCompany(raw, year);
        if (isCompany(company)) companies[company.orgnr] = company;
        else console.log("Invalid company", company, raw);

        const shareholder = mapShareholder(raw, ownership.shareHolderId);
        if (isShareholder(shareholder)) shareholders[shareholder.id] = shareholder;
        else console.log("Invalid shareholder", shareholder, raw);
      }
    })
    .on("end", async () => {
      console.log("------------- Data transform complete -------------");
      console.log("------------- Sample data -------------");
      console.log("OWNERSHIP:", Object.values(ownerships)[0]);
      console.log("COMPANY:", Object.values(companies)[0]);
      console.log("SHAREHOLDER", Object.values(shareholders)[0]);
      if (data?.includes("ownerships")) {
        await db.ownerships.bulkWrite(
          Object.values(ownerships).map(({ holdings, ...o }) => ({
            updateOne: {
              filter: {
                orgnr: o.orgnr,
                ...(o.shareholderOrgnr ? { shareholderOrgnr: o.shareholderOrgnr } : { shareHolderId: o.shareHolderId }),
              },
              update: { $set: { ...o, [`holdings.${year}`]: holdings[year] } },
              upsert: true,
            },
          }))
        );
      }
      if (data?.includes("companies")) {
        await db.companies.bulkWrite(
          Object.values(companies).map(({ shares, ...c }) => ({
            updateOne: {
              filter: { orgnr: c.orgnr },
              update: { $set: { ...c, [`shares.${year}`]: shares?.[year] } },
              upsert: true,
            },
          }))
        );
      }
      if (data?.includes("shareholders")) {
        await db.shareholders.bulkWrite(
          Object.values(shareholders).map((s) => ({
            updateOne: { filter: { id: s.id }, update: { $set: s }, upsert: true },
          }))
        );
      }
      console.log("------------- Data import complete -------------");
    });
};

const mapOwnership = (raw: OwnershipRaw, year: Year): Omit<Ownership, "_id"> => {
  return {
    orgnr: raw.orgnr,
    shareHolderId: raw.shareholderName + raw.yobOrOrgnr + raw.zipLocation + raw.countryCode,
    shareholderOrgnr: raw.yobOrOrgnr?.length === 9 ? raw.yobOrOrgnr : undefined,
    holdings: {
      [year]: { total: +raw.shareholderStocks, [raw.shareClass]: +raw.shareholderStocks },
    },
  };
};

const mapCompany = (raw: OwnershipRaw, year: Year): Omit<Company, "_id"> => {
  return { orgnr: raw.orgnr, name: raw.companyName, shares: { [year]: { total: +raw.companyStocks } } };
};

const mapShareholder = (raw: OwnershipRaw, id: string): Partial<Shareholder> => {
  return {
    id,
    name: raw.shareholderName,
    orgnr: raw.yobOrOrgnr?.length === 9 ? raw.yobOrOrgnr : undefined,
    yearOfBirth: raw.yobOrOrgnr?.length === 4 ? +raw.yobOrOrgnr : undefined,
    zipCode: raw.zipLocation && raw.zipLocation.length >= 4 ? raw.zipLocation.substr(0, 4) : undefined,
    location: raw.zipLocation && raw.zipLocation.length > 5 ? raw.zipLocation.substr(5) : undefined,
    countryCode: raw.countryCode,
    kind: getShareholderType(raw),
  };
};

const getShareholderType = (raw: OwnershipRaw): ShareholderType => {
  return raw.yobOrOrgnr?.length === 9
    ? ShareholderType.COMPANY
    : raw.yobOrOrgnr?.length === 4
    ? ShareholderType.PERSON
    : ShareholderType.UNKNOWN;
};
