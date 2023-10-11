import { Filter } from "mongodb";
import { Database } from "../../database/databaseSetup";
import { Ownership, Shareholder } from "../../models/models";

const defaultLimit = 100;

const db = () => Database.getInstance().db;

export const findOwnerships = ({
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
}) => {
  const filter: Filter<Ownership> = {};
  if (!shareholderOrgnr && !shareholderId) throw Error("Neither shareholder orgnr nor id provided.");
  if (shareholderOrgnr) filter.shareholderOrgnr = shareholderOrgnr;
  if (shareholderId) filter.shareHolderId = shareholderId;
  if (year) filter[`holdings.${year}.total`] = { $gt: 0 };
  return db()
    .ownerships.find(filter, { limit: limit ?? defaultLimit })
    .sort({ [`holdings.${year ?? 2022}.total`]: -1, _id: 1 })
    .skip(skip ?? 0)
    .toArray();
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

export const findCompanies = (orgnrs: string[]) =>
  db()
    .companies.find({ orgnr: { $in: orgnrs } })
    .toArray();
