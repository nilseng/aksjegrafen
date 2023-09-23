import { isEmpty, uniqWith } from "lodash";
import { graphDB } from "../../database/graphDB";
import { GraphLink, GraphLinkType, GraphNode } from "../../models/models";
import {
  NodeEntry,
  mapPathToGraph,
  mapPathsToGraph,
  mapRecordToGraphLink,
  mapRecordToGraphNode,
  mapUndirectedRecordToGraphLink,
} from "./neo4j.mapper";

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
        MATCH (n:Person|Unit|Shareholder|Company {uuid: $uuid}) 
        RETURN n
        LIMIT 1
    `,
    params: { uuid },
  });
  if (!records || records.length === 0) return null;
  return mapRecordToGraphNode(records[0], "n");
};

export const findNodesByUuids = async ({ uuids }: { uuids: string[] }) => {
  const records = await runQuery<{ node: NodeEntry }>({
    query: `
    MATCH (node: Company|Person|Shareholder|Unit)
    WHERE node.uuid IN $uuids
    RETURN node
    `,
    params: { uuids },
  });
  if (!records || records.length === 0) return [];
  return records.map((record) => mapRecordToGraphNode(record, "node"));
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

export const findInvestors = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip?: number }) => {
  const records = await runQuery<{ investor: NodeEntry; investment: NodeEntry }>({
    query: `
        MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
        WHERE investment.uuid = $uuid
        RETURN investor, investment, r
        ORDER BY r.share DESC
        SKIP ${skip ?? 0}
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

export const findInvestments = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip?: number }) => {
  const records = await runQuery({
    query: `
        MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
        WHERE investor.uuid = $uuid
        RETURN investor, investment, r
        ORDER BY r.share DESC
        SKIP ${skip ?? 0}
        LIMIT ${limit}
    `,
    params: { uuid },
  });
  if (!records || records.length === 0) return { nodes: [], links: [] };
  return {
    nodes: [mapRecordToGraphNode(records[0], "investor"), ...records.map((r) => mapRecordToGraphNode(r, "investment"))],
    links: records.map((record) =>
      mapRecordToGraphLink({ record, sourceKey: "investor", targetKey: "investment", relationshipKey: "r" })
    ),
  };
};

export const findRoleHolders = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip?: number }) => {
  const records = await runQuery({
    query: `
        MATCH (holder:Person|Unit)-[r]->(unit:Unit)
        WHERE unit.uuid = $uuid AND type(r) <> "OWNS"
        RETURN holder, r, unit
        SKIP ${skip ?? 0}
        LIMIT ${limit}
    `,
    params: { uuid },
  });
  if (!records || records.length === 0) return { nodes: [], links: [] };
  return {
    nodes: [mapRecordToGraphNode(records[0], "unit"), ...records.map((r) => mapRecordToGraphNode(r, "holder"))],
    links: records.map((record) =>
      mapRecordToGraphLink({ record, sourceKey: "holder", targetKey: "unit", relationshipKey: "r" })
    ),
  };
};

export const findRoleUnits = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip?: number }) => {
  const records = await runQuery({
    query: `
        MATCH (holder:Unit|Person)-[r]->(unit:Unit|Company)
        WHERE holder.uuid = $uuid AND type(r) <> "OWNS"
        RETURN holder, unit, r
        SKIP ${skip ?? 0}
        LIMIT ${limit}
    `,
    params: { uuid },
  });
  if (!records || records.length === 0) return { nodes: [], links: [] };
  return {
    nodes: [mapRecordToGraphNode(records[0], "holder"), ...records.map((r) => mapRecordToGraphNode(r, "unit"))],
    links: records.map((record) =>
      mapRecordToGraphLink({ record, sourceKey: "holder", targetKey: "unit", relationshipKey: "r" })
    ),
  };
};

export const findShortestPath = async ({
  isDirected,
  sourceUuid,
  targetUuid,
  linkTypes,
}: {
  isDirected?: boolean;
  sourceUuid: string;
  targetUuid: string;
  linkTypes?: GraphLinkType[];
}): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> => {
  const query = `
    MATCH (source:Person|Unit|Shareholder|Company {uuid: $sourceUuid})
    MATCH (target:Person|Unit|Shareholder|Company {uuid: $targetUuid})
    CALL gds.shortestPath.dijkstra.stream(${isDirected ? "'directedGraph'" : "'undirectedGraph'"}, {
      sourceNode: source,
      targetNode: target
      ${!isEmpty(linkTypes) ? ", relationshipTypes: $linkTypes" : ""}
    })
    YIELD index, path
    RETURN path
    ORDER BY index
  `;
  const records = await runQuery({ query, params: { sourceUuid, targetUuid, linkTypes } });

  const pathRecord = records[0]?.get("path");

  return pathRecord ? mapPathToGraph(pathRecord) : { nodes: [], links: [] };
};

export const findAllPaths = async ({
  isDirected = true,
  sourceUuid,
  targetUuid,
  linkTypes,
  limit,
}: {
  isDirected?: boolean;
  sourceUuid: string;
  targetUuid: string;
  linkTypes?: GraphLinkType[];
  limit: number;
}): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> => {
  const query = `
    MATCH (source:Person|Unit|Shareholder|Company {uuid: $sourceUuid})
    MATCH (target:Person|Unit|Shareholder|Company {uuid: $targetUuid})
    CALL gds.shortestPath.yens.stream(${isDirected ? "'directedGraph'" : "'undirectedGraph'"}, {
      sourceNode: source,
      targetNode: target,
      ${!isEmpty(linkTypes) ? "relationshipTypes: $linkTypes," : ""}
      k: ${limit}
    })
    YIELD index, path
    RETURN path
    ORDER BY index
  `;
  const records = await runQuery({ query, params: { sourceUuid, targetUuid, linkTypes, limit } });
  return records?.length > 0 ? mapPathsToGraph(records.map((record) => record.get("path"))) : { nodes: [], links: [] };
};

export const findRelationships = async ({
  links,
  isDirected,
}: {
  links: GraphLink[];
  isDirected?: boolean;
}): Promise<GraphLink[]> => {
  const query = `
    UNWIND $links as link
    MATCH (n1:Unit|Person|Company|Shareholder {uuid: link.source.properties.uuid})-[r]-${
      isDirected ? ">" : ""
    }(n2:Unit|Person|Company|Shareholder {uuid: link.target.properties.uuid})
    RETURN n1, r, n2
  `;
  const records = await runQuery({ query, params: { links } });
  return uniqWith(
    records.map((record) =>
      mapUndirectedRecordToGraphLink({ record, nodeKey1: "n1", nodeKey2: "n2", relationshipKey: "r" })
    ),
    (a, b) =>
      (a.source.properties.uuid === b.source.properties.uuid &&
        a.target.properties.uuid === b.target.properties.uuid) ||
      (a.source.properties.uuid === b.target.properties.uuid && a.target.properties.uuid === b.source.properties.uuid)
  );
};
