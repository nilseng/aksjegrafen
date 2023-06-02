import { graphDB } from "../../database/graphDB";
import { NodeEntry, mapRecordToGraphLink, mapRecordToGraphNode } from "./neo4j.mapper";

const runQuery = async <T extends { [key: string]: unknown } = never>({
  query,
  params,
}: {
  query: string;
  params?: unknown;
}) => {
  const session = graphDB.session();
  const res = await session.run<T>(query, params);
  session.close();
  return res.records;
};

export const findNode = async ({ uuid }: { uuid: string }) => {
  const records = await runQuery<{ n: NodeEntry }>({
    query: `
        MATCH (n) 
        WHERE n.uuid = $uuid
        RETURN n
        LIMIT 1
    `,
    params: { uuid },
  });
  if (!records || records.length === 0) return null;
  return mapRecordToGraphNode(records[0], "n");
};

export const searchNode = async ({ searchTerm, limit }: { searchTerm: string; limit: 10 }) => {
  const records = await runQuery<{ node: NodeEntry }>({
    query: `
    CALL db.index.fulltext.queryNodes("namesAndOrgnrs", "${searchTerm}") YIELD node
    RETURN node
    LIMIT ${limit}
    `,
  });
  if (!records || records.length === 0) return [];
  return records.map((record) => mapRecordToGraphNode(record, "node"));
};

export const findInvestors = async ({ uuid, limit }: { uuid: string; limit: number }) => {
  const records = await runQuery<{ investor: NodeEntry; investment: NodeEntry }>({
    query: `
        MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
        WHERE investment.uuid = $uuid
        RETURN investor, investment, r
        LIMIT ${limit}
    `,
    params: { uuid },
  });
  if (!records || records.length === 0) return { nodes: [], links: [] };
  return {
    nodes: [mapRecordToGraphNode(records[0], "investment"), ...records.map((r) => mapRecordToGraphNode(r, "investor"))],
    links: records.map((record) =>
      mapRecordToGraphLink({ record, sourceKey: "investor", targetKey: "investment", relationshipKey: "r" })
    ),
  };
};

export const findInvestments = ({ uuid, limit }: { uuid: string; limit: number }) =>
  runQuery({
    query: `
        MATCH (source:Shareholder)-[r:OWNS]->(investment:Company)
        WHERE source.uuid = $uuid
        RETURN source, investment, r
        LIMIT ${limit}
    `,
    params: { uuid },
  });

export const findRoleHolders = ({ uuid, limit }: { uuid: string; limit: number }) =>
  runQuery({
    query: `
        MATCH (holder:Person|Unit)-[r]->(source:Unit)
        WHERE source.uuid = $uuid AND type(r) <> "OWNS"
        RETURN holder, r, source
        LIMIT ${limit}
    `,
    params: { uuid },
  });

export const findRoleUnits = ({ uuid, limit }: { uuid: string; limit: number }) =>
  runQuery({
    query: `
        MATCH (source:Unit|Person)-[r]->(unit:Unit|Company)
        WHERE source.uuid = $uuid AND type(r) <> "OWNS"
        RETURN source, unit, r
        LIMIT ${limit}
    `,
    params: { uuid },
  });
