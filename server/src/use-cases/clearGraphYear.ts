import { Driver, int } from "neo4j-driver";
import { Year } from "../models/models";

/**
 * Clears a single year from the graph before re-importing it: deletes that year's
 * OWNS relationships and removes the year's total_stocks_<year> node property (so
 * companies that dropped out of the registry that year don't keep a stale value).
 * Nodes and all other years/roles are left untouched, unlike clearGraphDatabase
 * which wipes the whole graph.
 */
export const clearGraphYear = async (graphDB: Driver, year: Year): Promise<void> => {
  console.log(`Clearing year ${year} from the graph (OWNS edges + total_stocks_${year})...`);
  const session = graphDB.session();
  try {
    // apoc.periodic.iterate keeps batches small so the delete doesn't blow the heap
    // on millions of relationships. It does not throw on failed batches, so verify after.
    await session.run(
      `CALL apoc.periodic.iterate(
        'MATCH ()-[r:OWNS]->() WHERE r.year = $year RETURN r',
        'DELETE r',
        {batchSize: 10000, parallel: false, params: {year: $year}}
      )`,
      { year: int(year) }
    );

    const remaining = await session.run(`MATCH ()-[r:OWNS]->() WHERE r.year = $year RETURN count(r) AS count`, {
      year: int(year),
    });
    const count = remaining.records[0].get("count").toNumber();
    if (count > 0) throw new Error(`Clear of year ${year} incomplete: ${count} OWNS relationships remain`);

    await session.run(
      `CALL apoc.periodic.iterate(
        'MATCH (n) WHERE n.total_stocks_${year} IS NOT NULL RETURN n',
        'REMOVE n.total_stocks_${year}',
        {batchSize: 10000, parallel: false}
      )`
    );

    console.log(`Cleared year ${year} from the graph.`);
  } finally {
    await session.close();
  }
};
