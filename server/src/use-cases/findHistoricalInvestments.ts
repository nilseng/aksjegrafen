import { isNumber, mergeWith } from "lodash";
import {
  findCompanies,
  findMatchingOwnerships,
  findOwnerships,
  findShareholderById,
  findShareholders,
} from "../gateways/mongoDB/mongoDB.gateway";
import { Company, Ownership } from "../models/models";

export const findHistoricalInvestments = async ({
  shareholderOrgnr,
  shareholderId,
  year,
  limit,
  skip,
}: {
  shareholderOrgnr?: string;
  shareholderId?: string;
  year?: number;
  limit?: number;
  skip?: number;
}): Promise<Ownership[]> => {
  const ownerships = await findOwnerships({ shareholderOrgnr, shareholderId, year, limit, skip });
  const mergedOwnerships: Ownership[] = [];
  if (shareholderId) mergedOwnerships.push(...(await findMatchingInvestments({ shareholderId, ownerships })));
  else mergedOwnerships.push(...ownerships);
  const companies = await findCompanies(mergedOwnerships.map((o: Ownership) => o.orgnr));
  const investments = mergedOwnerships.map((o: Ownership) => {
    o.investment = companies.find((c: Company) => c.orgnr === o.orgnr);
    return o;
  });
  return investments;
};

const findMatchingInvestments = async ({
  shareholderId,
  ownerships,
}: {
  shareholderId: string;
  ownerships: Ownership[];
}) => {
  const mergedOwnerships: Ownership[] = [];
  const shareholder = await findShareholderById(shareholderId);
  const matchedShareholders = await findShareholders({
    name: shareholder?.name,
    yearOfBirth: shareholder?.yearOfBirth,
  });
  const matchedOwnerships = await findMatchingOwnerships({
    orgnrs: ownerships.map((o) => o.orgnr),
    shareholderIds: matchedShareholders.map((s) => s.id),
  });
  matchedOwnerships.forEach((o) => {
    const match = mergedOwnerships.find((m) => m.orgnr === o.orgnr);
    if (!match) mergedOwnerships.push(o);
    else {
      match.holdings = mergeWith(match.holdings, o.holdings, (val1, val2) => {
        if (isNumber(val1) && isNumber(val2)) {
          return val1 + val2;
        }
      });
    }
  });
  mergedOwnerships.sort((a, b) => ((a.holdings[2024]?.total ?? 0) > (b.holdings[2024]?.total ?? 0) ? -1 : 1));
  return mergedOwnerships;
};
