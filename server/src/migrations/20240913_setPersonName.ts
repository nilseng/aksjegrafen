import { Driver } from "neo4j-driver";

export const setPersonName = async (graphDB: Driver) => {
  const session = graphDB.session();
  const res = await session.run(`
        CALL apoc.periodic.iterate(
            "MATCH (p:Person) return p",
            "SET p.name = p.firstName + ' ' + p.lastName",
            {batchSize: 50000, paralell: true}
        )
    `);
  console.log(res);
  session.close();
};
