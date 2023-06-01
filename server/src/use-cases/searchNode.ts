import { Driver } from "neo4j-driver";
import { mapRecordToGraphNode } from "../mappers/mapRecordToGraphNode";

export const searchNode = async ({
  searchTerm,
  graphDB,
  limit,
}: {
  searchTerm: string;
  graphDB: Driver;
  limit: 10;
}) => {
  const session = graphDB.session();
  const res = await session.run(`
    CALL db.index.fulltext.queryNodes("namesAndOrgnrs", "${searchTerm}") YIELD node
    RETURN node
    LIMIT ${limit}
    `);
  session.close();
  return res.records.map((record) => mapRecordToGraphNode(record.get("node")));
};
