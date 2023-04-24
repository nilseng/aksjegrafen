import { IDatabase } from "../database/databaseSetup";
import { Company, Ownership, Relation } from "../models/models";

export const findShortestPath = async ({
  db,
  fromOrgnr,
  toOrgnr,
}: {
  db: IDatabase;
  fromOrgnr: string;
  toOrgnr: string;
}): Promise<Relation[] | null | undefined> => {
  const paths: Relation[][] = [];
  const roles = await db.roles.find({ "holder.unit.orgnr": fromOrgnr }).toArray();
  for (const role of roles) {
    if (role.orgnr === toOrgnr) return resolveCompanies(db, [{ role }]);
    else paths.push([{ role }]);
  }
  const ownerships = await db.ownerships.find({ shareholderOrgnr: fromOrgnr }).toArray();
  for (const ownership of ownerships) {
    if (ownership.orgnr === toOrgnr) return resolveCompanies(db, [{ ownership }]);
    else paths.push([{ ownership }]);
  }
  return findPaths(db, paths, toOrgnr, 1);
};

const findPaths = async (
  db: IDatabase,
  paths: Relation[][],
  toOrgnr: string,
  iteration: number
): Promise<Relation[] | null | undefined> => {
  const relation: Relation[] = [];
  if (iteration >= 10) {
    return undefined;
  }
  const orgnrs = paths.map((p) => getLastEdgeOrgnr(p));
  const ownerships = await db.ownerships
    .find({ shareholderOrgnr: { $in: orgnrs }, "holdings.2021.total": { $gt: 0 } })
    .toArray();
  const newPaths: Relation[][] = [];
  for (const o of ownerships) {
    const filteredPaths = paths.filter((p) => getLastEdgeOrgnr(p) === o.shareholderOrgnr);
    for (const path of filteredPaths) {
      if (hasLoop(path, o)) continue;
      else if (o.orgnr === toOrgnr) {
        relation.push(...path, { ownership: o });
        break;
      } else newPaths.push([...path, { ownership: o }]);
    }
    if (relation.length > 0) break;
  }
  if (relation.length > 0) return resolveCompanies(db, relation);
  return newPaths.length > 0 ? findPaths(db, newPaths, toOrgnr, iteration + 1) : null;
};

const getLastEdgeOrgnr = (path: Relation[]): string | undefined => {
  const edgeCount = path.length;
  return path[edgeCount - 1].role?.orgnr ?? path[edgeCount - 1].ownership?.orgnr;
};

const hasLoop = (path: Relation[], o: Ownership): boolean => {
  if (o.shareholderOrgnr === o.orgnr) return true;
  const edge = path.find((e) => e.ownership?.shareholderOrgnr === o.orgnr);
  return !!edge;
};

const resolveCompanies = async (db: IDatabase, path: Relation[]): Promise<Relation[]> => {
  const orgnrs = new Set<string>();
  for (const relation of path) {
    if (relation.role?.holder.unit?.orgnr) orgnrs.add(relation.role.holder.unit.orgnr);
    if (relation.role) orgnrs.add(relation.role.orgnr);
    if (relation.ownership?.shareholderOrgnr) orgnrs.add(relation.ownership.shareholderOrgnr);
    if (relation.ownership?.orgnr) orgnrs.add(relation.ownership.orgnr);
  }
  const companies = await db.companies.find({ orgnr: { $in: Array.from(orgnrs) } }).toArray();
  const shareholders = await db.shareholders.find({ orgnr: { $in: Array.from(orgnrs) } }).toArray();
  path.forEach((relation) => {
    if (relation.role?.holder.unit) {
      relation.role.holder.unit = {
        ...(getRoleHolderCompany(relation, companies) ?? {}),
        ...relation.role.holder.unit,
      };
    }
    if (relation.role?.orgnr) {
      relation.role.company = companies.find((c) => c.orgnr === relation.role.orgnr);
      relation.role.shareholder = shareholders.find((s) => s.orgnr === relation.role.orgnr);
    }
    if (relation.ownership?.shareholderOrgnr) {
      relation.ownership.investor = {
        company: companies.find((c) => c.orgnr === relation.ownership.shareholderOrgnr),
        shareholder: shareholders.find((s) => s.orgnr === relation.ownership.shareholderOrgnr),
      };
    }
    if (relation.ownership?.orgnr) {
      relation.ownership.investment = companies.find((c) => c.orgnr === relation.ownership.orgnr);
    }
  });
  return path;
};

const getRoleHolderCompany = (relation: Relation, companies: Company[]) => {
  const orgnr = relation.role?.holder.unit?.orgnr;
  if (!orgnr) return undefined;
  const company = companies.find((c) => c.orgnr === orgnr);
  return company;
};
