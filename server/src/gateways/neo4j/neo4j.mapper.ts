import { flatMap, uniqBy, uniqWith } from "lodash";
import { Integer, Node, Path, PathSegment, Record, Relationship } from "neo4j-driver";
import { GraphLink, GraphLinkType, GraphNode, GraphNodeLabel, Year } from "../../models/models";

interface NodeEntryProperties {
  uuid: string;
  name: string;
  orgnr?: string;
  id?: string;
  year_of_birth: string;
  location: string;
  // total_stocks_<year> for every year the node has been imported for
  [key: `total_stocks_${number}`]: number | undefined;
}

export type NodeEntry = Node<Integer, NodeEntryProperties, GraphNodeLabel>;

export interface RelationshipEntry {
  properties: {
    year?: Year;
    share?: number;
    stocks?: number;
  };
  type: string;
}

export const mapRecordToGraphNode = <T extends { [key: string]: NodeEntry } = never>(
  record: Record<T>,
  key: keyof T
): GraphNode => {
  const node: NodeEntry = record.get(key);
  return mapNodeEntryToGraphNode(node);
};

export const mapNodeEntryToGraphNode = (node: NodeEntry): GraphNode => {
  return {
    labels: node.labels,
    properties: {
      uuid: node.properties.uuid,
      name: node.properties.name,
      orgnr: node.properties.orgnr,
      shareholderId: node.properties.id,
      stocks: mapNodeStocks(node.properties),
      yearOfBirth: node.properties.year_of_birth,
      location: node.properties.location,
    },
  };
};

const mapNodeStocks = (properties: NodeEntryProperties): GraphNode["properties"]["stocks"] => {
  let stocks: GraphNode["properties"]["stocks"];
  for (const [key, value] of Object.entries(properties)) {
    const yearMatch = key.match(/^total_stocks_(\d{4})$/);
    if (!yearMatch || !value) continue;
    if (!stocks) stocks = {};
    stocks[+yearMatch[1]] = { total: value as number };
  }
  return stocks;
};

export const mapRecordToGraphLink = ({
  record,
  sourceKey,
  targetKey,
  relationshipKey,
}: {
  record: Record;
  sourceKey: string;
  targetKey: string;
  relationshipKey: string;
}): GraphLink => {
  return {
    source: mapRecordToGraphNode(record, sourceKey),
    target: mapRecordToGraphNode(record, targetKey),
    properties: record.get(relationshipKey).properties,
    type: record.get(relationshipKey).type,
  };
};

export const mapUndirectedRecordToGraphLink = ({
  record,
  nodeKey1,
  nodeKey2,
  relationshipKey,
}: {
  record: Record;
  nodeKey1: string;
  nodeKey2: string;
  relationshipKey: string;
}): GraphLink => {
  const n1 = record.get(nodeKey1);
  const n2 = record.get(nodeKey2);
  const relationship: Relationship = record.get(relationshipKey);
  return {
    source: relationship.startNodeElementId === n1.elementId ? n1 : n2,
    target: relationship.endNodeElementId === n2.elementId ? n2 : n1,
    properties: relationship.properties,
    type: getLinkType(relationship.type),
  };
};

export const mapPathsToGraph = (paths: Path[]): { nodes: GraphNode[]; links: GraphLink[] } => {
  const mappedPaths = paths.map((path) => mapPathToGraph(path));
  return {
    nodes: uniqBy(flatMap(mappedPaths, "nodes") as GraphNode[], "properties.uuid"),
    links: uniqWith(
      flatMap(mappedPaths, "links") as GraphLink[],
      (a, b) =>
        a.source.properties.uuid === b.source.properties.uuid &&
        a.target.properties.uuid === b.target.properties.uuid &&
        a.type === b.type &&
        a.properties.year === b.properties.year
    ),
  };
};

export const mapPathToGraph = (path: Path): { nodes: GraphNode[]; links: GraphLink[] } => ({
  nodes: uniqBy(
    [
      mapNodeEntryToGraphNode(path.start as NodeEntry),
      ...(path.segments.map((s) => s.end) as NodeEntry[]).map((n) => mapNodeEntryToGraphNode(n)),
    ],
    "properties.uuid"
  ),
  links: uniqWith(
    mapSegmentsToLinks(path.segments),
    (a, b) =>
      a.source.properties.uuid === b.source.properties.uuid &&
      a.target.properties.uuid === b.target.properties.uuid &&
      a.type === b.type &&
      a.properties.year === b.properties.year
  ),
});

const mapSegmentsToLinks = (segments: PathSegment[]): GraphLink[] =>
  segments.map((s) => ({
    source: mapNodeEntryToGraphNode(s.start as NodeEntry),
    target: mapNodeEntryToGraphNode(s.end as NodeEntry),
    type: getLinkType(s.relationship.type),
    properties: {
      ...s.relationship.properties,
      ...(s.relationship.properties.year?.low ? { year: s.relationship.properties.year?.low } : {}),
    },
  }));

const getLinkType = (type: string) => {
  const linkType = Object.values(GraphLinkType).find((t) => t === type);
  if (!linkType) return GraphLinkType.UNKNOWN;
  return linkType;
};
