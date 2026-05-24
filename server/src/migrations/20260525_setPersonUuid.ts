import { Driver } from "neo4j-driver";

// Person nodes were historically created without a uuid. The client identifies graph
// nodes by uuid, so uuid-less persons collapse into a single node (only one role holder
// shows per company). Backfill a uuid on every Person node still missing one.
export const setPersonUuid = async (graphDB: Driver) => {
  const session = graphDB.session();
  const res = await session.run(`
        CALL apoc.periodic.iterate(
            "MATCH (p:Person) WHERE p.uuid IS NULL return p",
            "SET p.uuid = randomUUID()",
            {batchSize: 50000, parallel: true}
        )
    `);
  console.log(res);
  session.close();
};
