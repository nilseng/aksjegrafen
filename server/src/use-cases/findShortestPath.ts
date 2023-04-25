import { IDatabase } from "../database/databaseSetup";
import { Company, Ownership, Relation } from "../models/models";
import { isMaxMemoryExceeded } from "../utils/isMaxMemoryExceeded";

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
  const roles = await db.roles
    .find({ "holder.unit.orgnr": fromOrgnr })
    .project({ orgnr: 1, type: 1, "holder.unit": 1 })
    .toArray();
  for (const role of roles) {
    if (role.orgnr === toOrgnr) return resolveCompanies(db, [{ role }]);
    else paths.push([{ role }]);
  }
  const ownerships = await db.ownerships
    .find({ shareholderOrgnr: fromOrgnr, "holdings.2021.total": { $gt: 0 } })
    .project({ shareholderOrgnr: 1, orgnr: 1, "holdings.2021.total": 1 })
    .toArray();
  for (const ownership of ownerships) {
    if (ownership.orgnr === toOrgnr) return resolveCompanies(db, [{ ownership }]);
    else paths.push([{ ownership }]);
  }
  const visitedOrgnrs = new Set(fromOrgnr);
  try {
    return findPaths(db, paths, toOrgnr, 1, visitedOrgnrs).catch((e) => {
      throw e;
    });
  } catch (e) {
    throw e;
  }
};

const findPaths = async (
  db: IDatabase,
  paths: Relation[][],
  toOrgnr: string,
  iteration: number,
  visitedOrgnrs: Set<string>
): Promise<Relation[] | null | undefined> => {
  if (isMaxMemoryExceeded()) throw Error("Memory limit exceeded. Could not find shortest path");
  const relation: Relation[] = [];
  if (iteration >= 100) {
    return undefined;
  }
  const orgnrs = new Set(paths.map((p) => getLastEdgeOrgnr(p)));
  const ownerships = await db.ownerships
    .find({ shareholderOrgnr: { $in: Array.from(orgnrs) }, "holdings.2021.total": { $gt: 0 } })
    .project({ shareholderOrgnr: 1, orgnr: 1, "holdings.2021.total": 1 })
    .toArray();
  const newPaths: Relation[][] = [];
  for (const o of ownerships) {
    const filteredPaths = paths.filter((p) => getLastEdgeOrgnr(p) === o.shareholderOrgnr);
    for (const path of filteredPaths) {
      if (hasLoop(path, o)) continue;
      else if (canBeRelaxed(o, newPaths, visitedOrgnrs)) continue;
      else if (o.orgnr === toOrgnr) {
        relation.push(...path, { ownership: o });
        break;
      } else {
        newPaths.push([...path, { ownership: o }]);
        visitedOrgnrs.add(o.shareholderOrgnr!);
      }
    }
    if (relation.length > 0) break;
  }
  if (relation.length > 0) return resolveCompanies(db, relation);
  if (newPaths.length === 0) return null;
  try {
    return findPaths(db, newPaths, toOrgnr, iteration + 1, visitedOrgnrs).catch((e) => {
      throw e;
    });
  } catch (e) {
    throw e;
  }
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

const canBeRelaxed = (o: Ownership, newPaths: Relation[][], visitedOrgnrs: Set<string>) => {
  return isVisited(o, visitedOrgnrs) || isInAnotherPath(o, newPaths);
};

const isVisited = (o: Ownership, visitedOrgnrs: Set<string>) => visitedOrgnrs.has(o.orgnr);

const isInAnotherPath = (o: Ownership, newPaths: Relation[][]) => {
  return !!newPaths
    .map((p) => p[p.length - 1])
    .find((r) => r.ownership?.orgnr === o.orgnr || r.role?.orgnr === o.orgnr);
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
