import { Driver } from "neo4j-driver";
import { GraphNode, GraphNodeLabel } from "../models/models";

interface NodeRecord {
  elementId: string;
  labels: GraphNodeLabel[];
  properties: {
    name: string;
    orgnr?: string;
    id?: string;
    total_stocks_2022?: number;
  };
}

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

const mapRecordToGraphNode = (record: NodeRecord): GraphNode => ({
  elementId: record.elementId,
  labels: record.labels,
  properties: {
    name: record.properties.name,
    orgnr: record.properties.orgnr,
    shareholderId: record.properties.id,
    stocks: record.properties.total_stocks_2022
      ? {
          2022: { total: record.properties.total_stocks_2022 },
        }
      : undefined,
  },
});
