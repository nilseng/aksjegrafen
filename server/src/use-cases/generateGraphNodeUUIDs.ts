import { Driver } from "neo4j-driver";

export const generateGraphNodeUUIDs = async (graphDB: Driver) => {
  const session = graphDB.session();
  const res = await session.run(`
        CALL apoc.periodic.iterate(
            '
            MATCH (n) 
            WHERE n.uuid IS NULL 
            RETURN n
            ',
            'SET n.uuid = randomUUID()',
            {batchSize: 50000, paralell: true}
        )
    `);
  console.log(res.records);
  console.log(res.summary);
  session.close();
};
