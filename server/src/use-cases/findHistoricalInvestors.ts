import { isNumber, mergeWith } from "lodash";
import { findCompanies, findOwnerships, findShareholdersByIds } from "../gateways/mongoDB/mongoDB.gateway";
import { Ownership } from "../models/models";

export const findHistoricalInvestors = async ({
  orgnr,
  year,
  limit,
  skip,
}: {
  orgnr: string;
  year?: number;
  limit?: number;
  skip?: number;
}): Promise<Ownership[]> => {
  const ownerships = await findOwnerships({ orgnr, year, limit, skip });
  await resolveShareholders(ownerships);
  return mergeOwnerships({ ownerships });
};

const resolveShareholders = async (ownerships: Ownership[]) => {
  const [shareholders, companies] = await Promise.all([
    findShareholdersByIds(ownerships.map((o) => o.shareHolderId)),
    findCompanies(ownerships.map((o) => o.orgnr)),
  ]);
  ownerships.forEach((o) => {
    o.investor = {
      shareholder: shareholders.find((s) => s.id === o.shareHolderId),
      company: companies.find((c) => c.orgnr === o.shareholderOrgnr),
    };
  });
};

const mergeOwnerships = async ({ ownerships }: { ownerships: Ownership[] }) => {
  const mergedOwnerships: Ownership[] = [];
  ownerships.forEach((o) => {
    if (!o.investor?.shareholder) mergedOwnerships.push(o);
    else {
      const match = mergedOwnerships.find(
        (m) =>
          m.investor?.shareholder &&
          m.investor.shareholder.name === o.investor?.shareholder?.name &&
          m.investor.shareholder.yearOfBirth === o.investor?.shareholder?.yearOfBirth
      );
      if (!match) mergedOwnerships.push(o);
      else {
        match.holdings = mergeWith(match.holdings, o.holdings, (val1, val2) => {
          if (isNumber(val1) && isNumber(val2)) {
            return val1 + val2;
          }
        });
      }
    }
  });
  return mergedOwnerships;
};
