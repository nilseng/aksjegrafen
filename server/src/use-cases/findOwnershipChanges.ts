import {
  aggregateOwnershipChanges,
  findCompanies,
  findShareholdersByIds,
  OwnershipChangeRow,
} from "../gateways/mongoDB/mongoDB.gateway";
import { OwnershipChange, OwnershipChangeType, OwnershipChanges, Year } from "../models/models";

// The diff runs on MongoDB, not the graph: the graph only holds the currently imported year,
// while the ownerships collection has holdings for every year since 2015. One document per
// (company, shareHolderId) holds both years, so an investor whose registry id changed between
// the years (persons are keyed by name/birth year/postal code, nominee accounts are separate
// registry entries) shows up as an exit plus a new entry rather than a change.

// Stakes moving less than this (as a fraction of the company) count as unchanged — share
// numbers carry rounding noise from stock counts.
const SHARE_EPSILON = 0.0001;

const toChange = (row: OwnershipChangeRow): OwnershipChange => ({
  investor: { shareholderId: row.shareHolderId, orgnr: row.shareholderOrgnr ?? undefined },
  type: Object.values(OwnershipChangeType).includes(row.type as OwnershipChangeType)
    ? (row.type as OwnershipChangeType)
    : OwnershipChangeType.Unchanged,
  share: {
    previous: row.previousShare ?? undefined,
    current: row.currentShare ?? undefined,
  },
  stocks: {
    previous: row.previousStocks >= 0 ? row.previousStocks : undefined,
    current: row.currentStocks >= 0 ? row.currentStocks : undefined,
  },
});

export const findOwnershipChanges = async ({
  orgnr,
  year,
  compareYear,
  limit,
  skip,
}: {
  orgnr: string;
  year: Year;
  compareYear: Year;
  limit: number;
  skip: number;
}): Promise<OwnershipChanges | null> => {
  const [company] = await findCompanies([orgnr]);
  if (!company) return null;

  const { counts, page } = await aggregateOwnershipChanges({
    orgnr,
    year,
    compareYear,
    currentTotal: company.shares?.[year]?.total,
    previousTotal: company.shares?.[compareYear]?.total,
    shareEpsilon: SHARE_EPSILON,
    limit,
    skip,
  });

  const summary = {
    [OwnershipChangeType.New]: 0,
    [OwnershipChangeType.Exited]: 0,
    [OwnershipChangeType.Increased]: 0,
    [OwnershipChangeType.Decreased]: 0,
    [OwnershipChangeType.Unchanged]: 0,
  };
  counts.forEach(({ type, count }) => {
    if (type in summary) summary[type as OwnershipChangeType] = count;
  });

  // Investor names are only needed for the returned page.
  const changes = page.map(toChange);
  const shareholders = await findShareholdersByIds(changes.map((change) => change.investor.shareholderId));
  changes.forEach((change) => {
    const shareholder = shareholders.find((s) => s.id === change.investor.shareholderId);
    change.investor.name = shareholder?.name;
    change.investor.orgnr = change.investor.orgnr ?? shareholder?.orgnr;
    change.investor.yearOfBirth = shareholder?.yearOfBirth;
    change.investor.location = shareholder?.location;
  });

  return {
    company: { name: company.name, orgnr: company.orgnr },
    year,
    compareYear,
    summary,
    changes,
  };
};
