import { chunk, isNumber, mergeWith, uniq } from "lodash";
import {
  findCompanies,
  findMatchingOwnerships,
  findOwnerships,
  findShareholderById,
  findShareholders,
} from "../gateways/mongoDB/mongoDB.gateway";
import { Company, Ownership } from "../models/models";
import { getLatestYear } from "../services/yearService";

// How many of a batch's per-orgnr ownership lookups run at the same time. Keeps a large
// batch from firing hundreds of concurrent queries at Mongo (and exhausting the pool).
const BATCH_QUERY_CONCURRENCY = 10;

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
  if (shareholderId) mergedOwnerships.push(...(await findMatchingInvestments({ shareholderId, ownerships, year })));
  else mergedOwnerships.push(...ownerships);
  return addInvestmentCompanies(mergedOwnerships);
};

// Batch variant: the investments of several company shareholders in one request. Equivalent to
// calling findHistoricalInvestments once per orgnr — `limit`/`skip` apply *per orgnr*, so a
// shareholder with many investments can't crowd out the others — but the lookups run
// concurrently and every result is enriched by a single companies query. Callers tell the
// results apart by the `shareholderOrgnr` each ownership already carries.
export const findHistoricalInvestmentsBatch = async ({
  shareholderOrgnrs,
  year,
  limit,
  skip,
}: {
  shareholderOrgnrs: string[];
  year?: number;
  limit?: number;
  skip?: number;
}): Promise<Ownership[]> => {
  const ownerships: Ownership[] = [];
  for (const orgnrs of chunk(shareholderOrgnrs, BATCH_QUERY_CONCURRENCY)) {
    const results = await Promise.all(
      orgnrs.map((shareholderOrgnr) => findOwnerships({ shareholderOrgnr, year, limit, skip }))
    );
    results.forEach((result) => ownerships.push(...result));
  }
  return addInvestmentCompanies(ownerships);
};

// Attaches the invested-in company to each ownership. One query for the whole set, and a
// lookup map rather than a scan per ownership — a batch can hold thousands of rows.
const addInvestmentCompanies = async (ownerships: Ownership[]): Promise<Ownership[]> => {
  const companies = await findCompanies(uniq(ownerships.map((o: Ownership) => o.orgnr)));
  const companiesByOrgnr = new Map(companies.map((c: Company) => [c.orgnr, c]));
  ownerships.forEach((o: Ownership) => {
    o.investment = companiesByOrgnr.get(o.orgnr);
  });
  return ownerships.filter((o) => !o.investment?.suppressed);
};

const findMatchingInvestments = async ({
  shareholderId,
  ownerships,
  year,
}: {
  shareholderId: string;
  ownerships: Ownership[];
  year?: number;
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
  const sortYear = year ?? getLatestYear();
  mergedOwnerships.sort((a, b) => ((a.holdings[sortYear]?.total ?? 0) > (b.holdings[sortYear]?.total ?? 0) ? -1 : 1));
  return mergedOwnerships;
};
