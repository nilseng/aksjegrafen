import { Driver } from "neo4j-driver";

/**
 * Deletes every role relationship (all types except OWNS) so a full roles re-import
 * doesn't leave roles behind for people/units that no longer hold them — the brreg
 * totalbestand dump is the complete current stock, so delete-then-reimport is an
 * accurate refresh. Person/Unit nodes are kept; the re-import MERGEs onto them.
 */
export const clearGraphRoles = async (graphDB: Driver): Promise<void> => {
  console.log("Deleting all role relationships from the graph...");
  const session = graphDB.session();
  try {
    // apoc.periodic.iterate does not throw on failed batches, so verify afterwards.
    await session.run(
      `CALL apoc.periodic.iterate(
        'MATCH ()-[r]->() WHERE type(r) <> "OWNS" RETURN r',
        'DELETE r',
        {batchSize: 10000, parallel: false}
      )`
    );

    const remaining = await session.run(`MATCH ()-[r]->() WHERE type(r) <> "OWNS" RETURN count(r) AS count`);
    const count = remaining.records[0].get("count").toNumber();
    if (count > 0) throw new Error(`Clear of role relationships incomplete: ${count} remain`);

    console.log("Deleted all role relationships.");
  } finally {
    await session.close();
  }
};
