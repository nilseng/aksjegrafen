import { Driver } from "neo4j-driver";
import { mapRecordToGraphNode } from "../mappers/mapRecordToGraphNode";

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
  return mapRecordToGraphNode(res.records[0].get("n"));
};
