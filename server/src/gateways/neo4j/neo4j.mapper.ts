import { Integer, Node, Path, PathSegment, Record } from "neo4j-driver";
import { GraphLink, GraphNode, GraphNodeLabel, Year } from "../../models/models";

interface NodeEntryProperties {
  uuid: string;
  name: string;
  orgnr?: string;
  id?: string;
  total_stocks_2022?: number;
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
      stocks: node.properties.total_stocks_2022
        ? {
            2022: { total: node.properties.total_stocks_2022 },
          }
        : undefined,
    },
  };
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

export const mapPathToGraph = (path: Path): { nodes: GraphNode[]; links: GraphLink[] } => ({
  nodes: [mapNodeEntryToGraphNode(path.start as NodeEntry), ...(path.segments.map((s) => s.end) as NodeEntry[])],
  links: mapSegmentsToLinks(path.segments),
});

const mapSegmentsToLinks = (segments: PathSegment[]): GraphLink[] =>
  segments.map((s) => ({
    source: mapNodeEntryToGraphNode(s.start as NodeEntry),
    target: mapNodeEntryToGraphNode(s.end as NodeEntry),
    type: s.relationship.type,
    properties: s.relationship.properties,
  }));
