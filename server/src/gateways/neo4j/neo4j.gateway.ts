import { isEmpty, uniqWith } from "lodash";
import { graphDB } from "../../database/graphDB";
import { GraphLink, GraphLinkType, GraphNode, IndirectOwnership, OwnershipChain, Year } from "../../models/models";
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
  try {
    const res = await session.run<T>(query, params);
    return res.records;
  } finally {
    await session.close();
  }
};

export const findNode = async ({ uuid }: { uuid: string }) => {
  const records = await runQuery<{ n: NodeEntry }>({
    query: `
        MATCH (n:Person|Unit|Shareholder|Company {uuid: $uuid})
        WHERE n.suppressed IS NULL
        RETURN n
        LIMIT 1
    `,
    params: { uuid },
  });
  if (!records || records.length === 0) return null;
  return mapRecordToGraphNode(records[0], "n");
};

export const findNodesByOrgnrs = async ({ orgnrs }: { orgnrs: string[] }) => {
  const records = await runQuery<{ node: NodeEntry }>({
    query: `
    MATCH (node: Company|Shareholder|Unit)
    WHERE node.orgnr IN $orgnrs AND node.suppressed IS NULL AND node.suppressed_search IS NULL
    RETURN node
    `,
    params: { orgnrs },
  });
  if (!records || records.length === 0) return [];
  return records.map((record) => mapRecordToGraphNode(record, "node"));
};

// The fulltext search term must be passed as a parameter — interpolating it into the
// query string allows Cypher injection — and Lucene's own operators are escaped so
// user input can neither break nor alter the fulltext query.
const escapeLuceneQuery = (searchTerm: string) => searchTerm.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&");

export const searchNode = async ({ searchTerm, limit }: { searchTerm: string; limit: number }) => {
  const records = await runQuery<{ node: NodeEntry }>({
    query: `
    CALL db.index.fulltext.queryNodes("namesAndOrgnrs", $searchTerm) YIELD node
    WHERE node.suppressed IS NULL AND node.suppressed_search IS NULL
    RETURN node
    LIMIT toInteger($limit)
    `,
    params: { searchTerm: escapeLuceneQuery(searchTerm), limit },
  });
  if (!records || records.length === 0) return [];
  return records.map((record) => mapRecordToGraphNode(record, "node"));
};

export const findInvestors = async ({
  uuid,
  year,
  limit,
  skip,
}: {
  uuid: string;
  year: Year;
  limit: number;
  skip?: number;
}) => {
  const records = await runQuery<{ investor: NodeEntry; investment: NodeEntry }>({
    query: `
        MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
        WHERE investment.uuid = $uuid AND r.year = ${year}
          AND investor.suppressed IS NULL AND investment.suppressed IS NULL
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

export const findInvestments = async ({
  uuid,
  year,
  limit,
  skip,
}: {
  uuid: string;
  year: Year;
  limit: number;
  skip?: number;
}) => {
  const records = await runQuery({
    query: `
        MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
        WHERE investor.uuid = $uuid AND r.year = ${year}
          AND investor.suppressed IS NULL AND investment.suppressed IS NULL
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

// Termination guard for the level-by-level traversal. Depth is not a product concept — deep
// chains are where indirect ownership matters most — the traversal simply runs until the
// minShare floor empties the frontier, which every real structure reaches quickly because
// chain weights are products of shares <= 1. The cap only stops pathological data (e.g. two
// companies each recorded as owning 100 % of the other, where weights never decay).
const MAX_TRAVERSAL_DEPTH = 100;

// Effective (indirect) ownership is computed level by level rather than by enumerating
// paths: enumerating all ownership chains into a widely held company (e.g. Equinor) means
// hundreds of thousands of paths and minutes of query time, while the per-level frontier is
// bounded by the number of distinct investors. Each round expands one ownership level and
// collapses the weights per investor before expanding further. Owners whose share of the
// target at a level falls below minShare are dropped and not expanded — weights only shrink
// further up a chain, so this bounds the frontier on widely held companies. Chains that
// revisit the target (cross-ownership cycles) are cut; other cycles contribute their
// geometric series until they decay below minShare.
export const findIndirectInvestors = async ({
  uuid,
  orgnr,
  year,
  minShare,
  personsOnly,
  limit,
  skip,
}: {
  uuid?: string;
  orgnr?: string;
  year: Year;
  minShare: number;
  personsOnly?: boolean;
  limit: number;
  skip?: number;
}): Promise<{ node: GraphNode | null; investors: IndirectOwnership[] }> => {
  const targetRecords = await runQuery({
    query: `
        MATCH (target:Company {${uuid ? "uuid: $uuid" : "orgnr: $orgnr"}})
        WHERE target.suppressed IS NULL
        RETURN target
        LIMIT 1
    `,
    params: { uuid, orgnr },
  });
  if (!targetRecords || targetRecords.length === 0) return { node: null, investors: [] };
  const node = mapRecordToGraphNode(targetRecords[0], "target");
  const targetUuid = node.properties.uuid;

  const ownershipByUuid = new Map<
    string,
    { effectiveShare: number; directShare: number; pathCount: number; minDepth: number; isPerson: boolean }
  >();
  let frontier: { uuid: string; weight: number; walks: number }[] = [{ uuid: targetUuid, weight: 1, walks: 1 }];

  for (let depth = 1; depth <= MAX_TRAVERSAL_DEPTH && frontier.length > 0; depth++) {
    const records = await runQuery({
      query: `
        UNWIND $frontier AS f
        MATCH (owner:Shareholder)-[r:OWNS]->(m:Company {uuid: f.uuid})
        // owner <> m drops treasury shares (a company owning itself): the self-loop would
        // otherwise compound into phantom indirect ownership (>100 % for a sole owner).
        WHERE r.year = ${year} AND r.share IS NOT NULL AND owner <> m AND owner.uuid <> $targetUuid
          AND owner.suppressed IS NULL
        WITH owner, sum(r.share * f.weight) AS weight, sum(f.walks) AS walks
        WHERE weight >= $minShare
        RETURN owner.uuid AS uuid, weight, walks, "Company" IN labels(owner) AS isCompany,
          owner.year_of_birth IS NOT NULL AS isPerson
      `,
      params: { frontier, targetUuid, minShare },
    });
    frontier = [];
    for (const record of records ?? []) {
      const ownerUuid = record.get("uuid") as string;
      const weight = record.get("weight") as number;
      const walks = record.get("walks") as number;
      const entry = ownershipByUuid.get(ownerUuid) ?? {
        effectiveShare: 0,
        directShare: 0,
        pathCount: 0,
        minDepth: depth,
        isPerson: record.get("isPerson") as boolean,
      };
      entry.effectiveShare += weight;
      if (depth === 1) entry.directShare = weight;
      entry.pathCount += walks;
      ownershipByUuid.set(ownerUuid, entry);
      // Only companies can be owned, so a person in the frontier would never match anyway.
      if (record.get("isCompany")) frontier.push({ uuid: ownerUuid, weight, walks });
    }
  }

  const ranked = [...ownershipByUuid.entries()]
    // Person detection uses year_of_birth, which the registry provides for individuals but
    // not for companies; foreign entities without one are treated as companies.
    .filter(([, ownership]) => !personsOnly || ownership.isPerson)
    .sort(([, a], [, b]) => b.effectiveShare - a.effectiveShare)
    .slice(skip ?? 0, (skip ?? 0) + limit)
    .map(([investorUuid, { isPerson, ...ownership }]) => [investorUuid, ownership] as const);
  if (ranked.length === 0) return { node, investors: [] };

  const investorRecords = await runQuery({
    query: `
        MATCH (investor:Shareholder)
        WHERE investor.uuid IN $uuids
        RETURN investor
    `,
    params: { uuids: ranked.map(([investorUuid]) => investorUuid) },
  });
  const investorsByUuid = new Map<string, GraphNode>(
    (investorRecords ?? []).map((record) => {
      const investor = mapRecordToGraphNode(record, "investor");
      return [investor.properties.uuid, investor];
    })
  );
  return {
    node,
    investors: ranked
      .filter(([investorUuid]) => investorsByUuid.has(investorUuid))
      .map(([investorUuid, ownership]) => ({ investor: investorsByUuid.get(investorUuid)!, ...ownership })),
  };
};

// Enumerates the actual ownership chains from one investor to the target, for documenting
// how an effective share arises (KYC reports). Unlike findIndirectInvestors this walks
// simple paths, so it must only be called for a single investor at a time with a modest
// limit — enumerating all paths into a widely held company is prohibitively slow.
export const findOwnershipChains = async ({
  investorUuid,
  targetUuid,
  year,
  maxDepth,
  limit,
}: {
  investorUuid: string;
  targetUuid: string;
  year: Year;
  maxDepth: number;
  limit: number;
}): Promise<OwnershipChain[]> => {
  const records = await runQuery({
    query: `
        MATCH (investor:Shareholder {uuid: $investorUuid})
        MATCH (target:Company {uuid: $targetUuid})
        MATCH path = (investor)-[:OWNS*1..${maxDepth}]->(target)
        WHERE all(r IN relationships(path) WHERE r.year = ${year} AND r.share IS NOT NULL)
        AND none(n IN nodes(path) WHERE n.suppressed IS NOT NULL)
        AND none(n IN nodes(path)[1..-1] WHERE n = target)
        // Treasury shares (self-loop edges) are not part of an ownership chain.
        AND none(r IN relationships(path) WHERE startNode(r) = endNode(r))
        RETURN [n IN nodes(path) | {uuid: n.uuid, name: n.name, orgnr: n.orgnr}] AS nodes,
          [r IN relationships(path) | r.share] AS shares,
          reduce(share = 1.0, r IN relationships(path) | share * r.share) AS product
        ORDER BY product DESC
        LIMIT ${limit}
    `,
    params: { investorUuid, targetUuid },
  });
  return (records ?? []).map((record) => ({
    nodes: record.get("nodes") as OwnershipChain["nodes"],
    shares: record.get("shares") as number[],
    product: record.get("product") as number,
  }));
};

export const findRoleHolders = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip?: number }) => {
  const records = await runQuery({
    query: `
        MATCH (holder:Person|Unit)-[r]->(unit:Unit)
        WHERE unit.uuid = $uuid AND type(r) <> "OWNS"
          AND holder.suppressed IS NULL AND unit.suppressed IS NULL
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
          AND holder.suppressed IS NULL AND unit.suppressed IS NULL
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
    WHERE NONE(n IN nodes(path) WHERE n.suppressed IS NOT NULL)
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
    WHERE NONE(n IN nodes(path) WHERE n.suppressed IS NOT NULL)
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
    WHERE n1.suppressed IS NULL AND n2.suppressed IS NULL
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
