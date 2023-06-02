import { Record } from "neo4j-driver";
import { GraphNode, GraphNodeLabel } from "../../models/models";

export interface NodeRecord {
  elementId: string;
  labels: GraphNodeLabel[];
  properties: {
    uuid: string;
    name: string;
    orgnr?: string;
    id?: string;
    total_stocks_2022?: number;
  };
}

interface RelationshipRecord {
  source: NodeRecord;
  target: NodeRecord;
}

export const mapRecordToGraphNode = <T extends { [key: string]: NodeRecord } = never>(
  record: Record<T>,
  key: keyof T
): GraphNode => {
  const node = record.get(key);
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

export const mapRecordToGraphLink = () => {};
