import { Driver } from "neo4j-driver";

// The registry for year N is published in May of N+1, so until the graph years are
// loaded the best guess for the latest available data year is last calendar year.
const fallbackLatestYear = () => new Date().getFullYear() - 1;

let availableYears: number[] = [];

/**
 * Loads the years present in the graph (distinct OWNS.year values) into an in-memory
 * cache so year defaults follow the data instead of being hardcoded. Called once at
 * server startup; Heroku cycles dynos daily, so the cache picks up new imports
 * without explicit invalidation.
 */
export const loadAvailableYears = async (graphDB: Driver): Promise<void> => {
  const session = graphDB.session();
  try {
    const result = await session.run(
      `MATCH ()-[r:OWNS]->() WITH DISTINCT r.year AS year RETURN year ORDER BY year DESC`
    );
    availableYears = result.records.map((r) => Number(r.get("year"))).filter((year) => Number.isFinite(year));
    console.log(`Available graph years: ${availableYears.join(", ") || "(none)"}`);
  } finally {
    await session.close();
  }
};

/** Years available in the graph, newest first. */
export const getAvailableYears = (): number[] =>
  availableYears.length ? availableYears : [fallbackLatestYear()];

export const getLatestYear = (): number => getAvailableYears()[0];
