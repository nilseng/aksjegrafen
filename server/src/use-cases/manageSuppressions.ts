import { Filter } from "mongodb";
import { Driver } from "neo4j-driver";
import { IDatabase } from "../database/mongoDB";
import { Shareholder, Suppression } from "../models/models";

// Mongo/Neo4j property names for each suppression scope. Queries treat the two
// flags differently: search queries filter on both, relation/lookup queries only
// on the full "suppressed" flag.
const flagFields = {
  search: { mongo: "suppressedSearch", neo4j: "suppressed_search" },
  all: { mongo: "suppressed", neo4j: "suppressed" },
};

/**
 * Re-derives all suppression flags in MongoDB and Neo4j from the suppression list.
 * Clears every existing flag first, so removing an entry from the list and re-applying
 * unsuppresses it. Idempotent — safe to run at any time, and must be re-run after data
 * imports since those rebuild the flagged documents/nodes.
 */
export const applySuppressions = async ({ db, graphDB }: { db: IDatabase; graphDB: Driver }): Promise<number> => {
  const suppressions = await db.suppressions.find({}).toArray();
  await clearSuppressionFlags({ db, graphDB });
  for (const suppression of suppressions) {
    await applySuppression({ db, graphDB, suppression });
  }
  return suppressions.length;
};

export const findNoindexOrgnrs = async ({ db }: { db: IDatabase }): Promise<string[]> => {
  const suppressions = await db.suppressions.find({ noindex: true }).toArray();
  return suppressions.map((s) => s.orgnr).filter((orgnr): orgnr is string => !!orgnr);
};

const clearSuppressionFlags = async ({ db, graphDB }: { db: IDatabase; graphDB: Driver }) => {
  const flagged = {
    $or: [{ suppressed: { $exists: true } }, { suppressedSearch: { $exists: true } }, { noindex: { $exists: true } }],
  };
  const unset = { $unset: { suppressed: "" as const, suppressedSearch: "" as const, noindex: "" as const } };
  await db.companies.updateMany(flagged, unset);
  await db.shareholders.updateMany(flagged, unset);
  await db.roles.updateMany(flagged, unset);

  const session = graphDB.session();
  try {
    await session.run(`
      MATCH (n)
      WHERE n.suppressed IS NOT NULL OR n.suppressed_search IS NOT NULL
      REMOVE n.suppressed, n.suppressed_search
    `);
  } finally {
    await session.close();
  }
};

const applySuppression = async ({
  db,
  graphDB,
  suppression,
}: {
  db: IDatabase;
  graphDB: Driver;
  suppression: Suppression;
}) => {
  // The noindex flag on the company document keeps the page out of the sitemap;
  // the response header itself is derived from the suppression entry (see the
  // noindexSuppressedPages middleware).
  if (suppression.noindex && suppression.orgnr) {
    await db.companies.updateMany({ orgnr: suppression.orgnr }, { $set: { noindex: true } });
  }
  if (suppression.scope === "none") return;
  const fields = flagFields[suppression.scope];
  if (suppression.type === "company") await suppressCompany({ db, graphDB, suppression, fields });
  else await suppressPerson({ db, graphDB, suppression, fields });
};

const suppressCompany = async ({
  db,
  graphDB,
  suppression,
  fields,
}: {
  db: IDatabase;
  graphDB: Driver;
  suppression: Suppression;
  fields: { mongo: string; neo4j: string };
}) => {
  if (!suppression.orgnr) return;
  await db.companies.updateMany({ orgnr: suppression.orgnr }, { $set: { [fields.mongo]: true } });
  await db.shareholders.updateMany({ orgnr: suppression.orgnr }, { $set: { [fields.mongo]: true } });
  // Roles the company holds in other units, rendered on those units' pages.
  await db.roles.updateMany({ "holder.unit.orgnr": suppression.orgnr }, { $set: { [fields.mongo]: true } });

  const session = graphDB.session();
  try {
    await session.run(
      `
      MATCH (n:Company|Unit|Shareholder|Organization)
      WHERE n.orgnr = $orgnr
      SET n.${fields.neo4j} = true
      `,
      { orgnr: suppression.orgnr }
    );
  } finally {
    await session.close();
  }
};

const suppressPerson = async ({
  db,
  graphDB,
  suppression,
  fields,
}: {
  db: IDatabase;
  graphDB: Driver;
  suppression: Suppression;
  fields: { mongo: string; neo4j: string };
}) => {
  if (!suppression.shareholderId && !suppression.name) return;

  const clauses: Filter<Shareholder>[] = [];
  if (suppression.shareholderId) clauses.push({ id: suppression.shareholderId });
  if (suppression.name) {
    const nameClause: Filter<Shareholder> = {
      name: { $regex: `^${escapeRegex(suppression.name)}$`, $options: "i" },
    };
    if (suppression.yearOfBirth) nameClause.yearOfBirth = suppression.yearOfBirth;
    clauses.push(nameClause);
  }
  await db.shareholders.updateMany({ $or: clauses }, { $set: { [fields.mongo]: true } });

  // Role documents (rendered on the server-side company pages) store the person as
  // fornavn/etternavn, so the match compares against the concatenated full name.
  if (suppression.name) {
    await db.roles.updateMany(
      {
        "holder.person": { $exists: true },
        $expr: {
          $eq: [
            {
              $toLower: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$holder.person.fornavn", ""] },
                      " ",
                      { $ifNull: ["$holder.person.etternavn", ""] },
                    ],
                  },
                },
              },
            },
            suppression.name.trim().toLowerCase(),
          ],
        },
      },
      { $set: { [fields.mongo]: true } }
    );
  }

  // Person nodes from the roles import carry a name but no year of birth, so a name-only
  // match is allowed when the node has no year_of_birth to compare against.
  const session = graphDB.session();
  try {
    await session.run(
      `
      MATCH (n:Person|Shareholder)
      WHERE ($shareholderId IS NOT NULL AND n.id = $shareholderId)
        OR (
          $name IS NOT NULL AND toLower(n.name) = toLower($name)
          AND ($yearOfBirth IS NULL OR n.year_of_birth IS NULL OR toString(n.year_of_birth) = $yearOfBirth)
        )
      SET n.${fields.neo4j} = true
      `,
      {
        shareholderId: suppression.shareholderId ?? null,
        name: suppression.name ?? null,
        yearOfBirth: suppression.yearOfBirth?.toString() ?? null,
      }
    );
  } finally {
    await session.close();
  }
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
