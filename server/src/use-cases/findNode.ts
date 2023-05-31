import { Driver } from "neo4j-driver";

export const findNode = async ({ id, graphDB }: { id: string; graphDB: Driver }) => {
  const session = graphDB.session();
  const res = await session.run(
    `
        MATCH (n) 
        WHERE n.uuid = $id
        RETURN n
        LIMIT 1
    `,
    { id }
  );
  session.close();
  return res.records[0];
};
