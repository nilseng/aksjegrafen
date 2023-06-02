import { graphDB } from "../../database/graphDB";
import { NodeRecord, mapRecordToGraphNode } from "./neo4j.mapper";

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
  const records = await runQuery<{ n: NodeRecord }>({
    query: `
        MATCH (n) 
        WHERE n.uuid = $uuid
        RETURN n
        LIMIT 1
    `,
    params: { uuid },
  });
  return mapRecordToGraphNode<{ n: NodeRecord }>(records[0], "n");
};

export const searchNode = async ({ searchTerm, limit }: { searchTerm: string; limit: 10 }) => {
  const records = await runQuery<{ node: NodeRecord }>({
    query: `
    CALL db.index.fulltext.queryNodes("namesAndOrgnrs", "${searchTerm}") YIELD node
    RETURN node
    LIMIT ${limit}
    `,
  });
  return records.map((record) => mapRecordToGraphNode<{ node: NodeRecord }>(record, "node"));
};

export const findInvestors = async ({ uuid, limit }: { uuid: string; limit: number }) => {
  const records = await runQuery<{ source: NodeRecord }>({
    query: `
        MATCH (investor:Shareholder)-[r:OWNS]->(source:Company)
        WHERE source.uuid = $uuid
        RETURN investor, source, r
        LIMIT ${limit}
    `,
    params: { uuid },
  });
  return {
    nodes: [mapRecordToGraphNode<{ source: NodeRecord }>(records[0], "source")],
    links: [],
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
