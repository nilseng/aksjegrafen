import { IDatabase } from "../database/databaseSetup";
import { Company, Relation } from "../models/models";
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
  const relation: Relation[] = [];
  if (iteration >= 100) {
    return undefined;
  }
  const orgnrSet = new Set(paths.map((p) => getLastEdgeOrgnr(p)));
  const orgnrs = Array.from(orgnrSet);
  const ownerships = await db.ownerships
    .find({ shareholderOrgnr: { $in: orgnrs }, "holdings.2021.total": { $gt: 0 } })
    .project({ shareholderOrgnr: 1, orgnr: 1, "holdings.2021.total": 1 })
    .toArray();
  if (isMaxMemoryExceeded()) throw Error("Memory limit exceeded. Could not find shortest path");
  const roles = await db.roles
    .find({ "holder.unit.orgnr": { $in: orgnrs } })
    .project({ orgnr: 1, type: 1, "holder.unit": 1 })
    .toArray();
  if (isMaxMemoryExceeded()) throw Error("Memory limit exceeded. Could not find shortest path");
  const newPaths: Relation[][] = [];
  const relationMap: { [targetOrgnr: string]: Relation } = {};
  ownerships.forEach((ownership) => {
    relationMap[ownership.orgnr] = { ownership };
  });
  roles.forEach((role) => {
    relationMap[role.orgnr] = { role };
  });
  for (const r of Object.values(relationMap)) {
    const path = paths.find((p) => getLastEdgeOrgnr(p) === getSourceOrgnr(r));
    if (!path) {
      console.error(`Path ending with orgnr=${getSourceOrgnr(r)} not found`);
      continue;
    }
    if (hasLoop(path, r)) continue;
    else if (canBeRelaxed(r, newPaths, visitedOrgnrs)) continue;
    else if (getTargetOrgnr(r) === toOrgnr) {
      relation.push(...path, r);
      break;
    } else {
      newPaths.push([...path, r]);
      visitedOrgnrs.add(getSourceOrgnr(r)!);
    }
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
  return getTargetOrgnr(path[edgeCount - 1]);
};

const getTargetOrgnr = (relation: Relation) => {
  return relation.role?.orgnr ?? relation.ownership?.orgnr;
};

const getSourceOrgnr = (relation: Relation) =>
  relation.role?.holder.unit?.orgnr ?? relation.ownership?.shareholderOrgnr;

const hasLoop = (path: Relation[], r: Relation): boolean => {
  if (r.ownership && r.ownership.shareholderOrgnr === r.ownership.orgnr) return true;
  if (r.role && r.role.holder.unit?.orgnr === r.role.orgnr) return true;
  const edge = path.find((e) => getSourceOrgnr(e) === getTargetOrgnr(r));
  return !!edge;
};

const canBeRelaxed = (r: Relation, newPaths: Relation[][], visitedOrgnrs: Set<string>) => {
  return isVisited(r, visitedOrgnrs) || isInAnotherPath(r, newPaths);
};

const isVisited = (r: Relation, visitedOrgnrs: Set<string>) => {
  const orgnr = getTargetOrgnr(r);
  return orgnr ? visitedOrgnrs.has(orgnr) : false;
};

const isInAnotherPath = (r: Relation, newPaths: Relation[][]) => {
  return !!newPaths.map((p) => p[p.length - 1]).find((leaf) => getTargetOrgnr(leaf) === getTargetOrgnr(r));
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
