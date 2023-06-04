import { Driver } from "neo4j-driver";

export const fixNodeLabels = async (graphDB: Driver) => {
  const session = graphDB.session();

  console.info("Fixing node labels");

  // Shareholders without relationships should be deleted
  await session.run(`
    MATCH (n:Shareholder)
    WHERE NOT (n)--()
    DELETE n
  `);
  console.info("Deleted unlinked Shareholders.");

  // Units with no owners should not have the label Company
  await session.run(`
    MATCH (n:Company)
    WHERE NOT ()-[:OWNS]->(n)
    REMOVE n:Company
  `);
  console.info("Removed incorrect Company labels.");

  // Nodes with no relationships should not exist
  await session.run(`
    CALL apoc.periodic.iterate(
        'MATCH (n) WHERE NOT (n)--() RETURN n',
        'DELETE n',
        {batchSize: 10000}
    )
  `);
  console.info("Deleted unlinked nodes.");

  session.close();
};
