import { Filter } from "mongodb";
import { Database } from "../../database/databaseSetup";
import { Ownership, Shareholder } from "../../models/models";

const defaultLimit = 100;

const db = () => Database.getInstance().db;

export const findOwnerships = ({
  orgnr,
  shareholderOrgnr,
  shareholderId,
  year,
  limit,
  skip,
}: {
  orgnr?: string;
  shareholderOrgnr?: string;
  shareholderId?: string;
  year?: number;
  limit?: number;
  skip?: number;
}) => {
  const filter: Filter<Ownership> = {};
  if (orgnr) filter.orgnr = orgnr;
  if (shareholderOrgnr) filter.shareholderOrgnr = shareholderOrgnr;
  if (shareholderId) filter.shareHolderId = shareholderId;
  if (year) filter[`holdings.${year}.total`] = { $gt: 0 };
  return db()
    .ownerships.find(filter, { limit: limit ?? defaultLimit })
    .sort({ [`holdings.${year ?? 2025}.total`]: -1, _id: 1 })
    .skip(skip ?? 0)
    .toArray();
};

export interface OwnershipChangeRow {
  shareHolderId: string;
  shareholderOrgnr?: string | null;
  // -1 is the sentinel for "no stake that year" (real stock counts are always positive).
  currentStocks: number;
  previousStocks: number;
  currentShare: number | null;
  previousShare: number | null;
  type: string;
}

// Year-over-year diff of a company's ownerships, computed inside MongoDB: widely held
// companies have >100k ownership documents, so classification, the summary counts and the
// sort/pagination run in an aggregation and only the requested page crosses the wire.
export const aggregateOwnershipChanges = async ({
  orgnr,
  year,
  compareYear,
  currentTotal,
  previousTotal,
  shareEpsilon,
  limit,
  skip,
}: {
  orgnr: string;
  year: number;
  compareYear: number;
  currentTotal?: number;
  previousTotal?: number;
  shareEpsilon: number;
  limit: number;
  skip: number;
}): Promise<{ counts: { type: string; count: number }[]; page: OwnershipChangeRow[] }> => {
  const bothSharesKnown = [{ $ne: ["$currentShare", null] }, { $ne: ["$previousShare", null] }];
  const [result] = await db()
    .ownerships.aggregate<{ summary: { _id: string; count: number }[]; page: OwnershipChangeRow[] }>([
      {
        $match: {
          orgnr,
          $or: [{ [`holdings.${year}.total`]: { $gt: 0 } }, { [`holdings.${compareYear}.total`]: { $gt: 0 } }],
        },
      },
      {
        $project: {
          shareHolderId: 1,
          shareholderOrgnr: 1,
          currentStocks: { $ifNull: [`$holdings.${year}.total`, -1] },
          previousStocks: { $ifNull: [`$holdings.${compareYear}.total`, -1] },
        },
      },
      {
        $addFields: {
          currentShare: currentTotal
            ? { $cond: [{ $lt: ["$currentStocks", 0] }, null, { $divide: ["$currentStocks", currentTotal] }] }
            : null,
          previousShare: previousTotal
            ? { $cond: [{ $lt: ["$previousStocks", 0] }, null, { $divide: ["$previousStocks", previousTotal] }] }
            : null,
        },
      },
      {
        // Mirrors the classification in the findOwnershipChanges use-case: presence decides
        // New/Exited, then share deltas when both company totals are known (an emisjon moves
        // the share without the stock count changing), then raw stock counts as fallback.
        $addFields: {
          type: {
            $switch: {
              branches: [
                {
                  case: { $and: [{ $lt: ["$previousStocks", 0] }, { $gte: ["$currentStocks", 0] }] },
                  then: "New",
                },
                {
                  case: { $and: [{ $gte: ["$previousStocks", 0] }, { $lt: ["$currentStocks", 0] }] },
                  then: "Exited",
                },
                {
                  case: {
                    $and: [
                      ...bothSharesKnown,
                      { $gt: [{ $subtract: ["$currentShare", "$previousShare"] }, shareEpsilon] },
                    ],
                  },
                  then: "Increased",
                },
                {
                  case: {
                    $and: [
                      ...bothSharesKnown,
                      { $lt: [{ $subtract: ["$currentShare", "$previousShare"] }, -shareEpsilon] },
                    ],
                  },
                  then: "Decreased",
                },
                { case: { $and: bothSharesKnown }, then: "Unchanged" },
                { case: { $gt: ["$currentStocks", "$previousStocks"] }, then: "Increased" },
                { case: { $lt: ["$currentStocks", "$previousStocks"] }, then: "Decreased" },
              ],
              default: "Unchanged",
            },
          },
          magnitude: {
            $abs: { $subtract: [{ $ifNull: ["$currentShare", 0] }, { $ifNull: ["$previousShare", 0] }] },
          },
        },
      },
      {
        $facet: {
          summary: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
          page: [{ $sort: { magnitude: -1, currentShare: -1, _id: 1 } }, { $skip: skip }, { $limit: limit }],
        },
      },
    ])
    .toArray();
  return {
    counts: (result?.summary ?? []).map((entry) => ({ type: entry._id, count: entry.count })),
    page: result?.page ?? [],
  };
};

export const findMatchingOwnerships = ({ orgnrs, shareholderIds }: { orgnrs: string[]; shareholderIds: string[] }) =>
  db()
    .ownerships.find({
      orgnr: { $in: orgnrs },
      shareHolderId: { $in: shareholderIds },
    })
    .toArray();

export const findShareholderById = (id: string) => db().shareholders.findOne({ id });

export const findShareholders = (shareholder: Partial<Shareholder>) => db().shareholders.find(shareholder).toArray();

export const findShareholdersByIds = (ids: string[]) =>
  db()
    .shareholders.find({ id: { $in: ids } })
    .toArray();

export const findCompanies = (orgnrs: string[]) =>
  db()
    .companies.find({ orgnr: { $in: orgnrs } })
    .toArray();
