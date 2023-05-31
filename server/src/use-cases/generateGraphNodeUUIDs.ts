import { Driver } from "neo4j-driver";

export const generateGraphNodeUUIDs = async (graphDB: Driver) => {
  const session = graphDB.session();
  const res = await session.run(`
        CALL apoc.periodic.iterate(
            'MATCH (n) RETURN n',
            'SET n.uuid = randomUUID()',
            {batchSize: 10000, paralell: true}
        )
    `);
  console.log(res.records);
  console.log(res.summary);
  session.close();
};
