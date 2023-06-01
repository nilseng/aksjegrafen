import { GraphNode, GraphNodeLabel } from "../models/models";

interface NodeRecord {
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

export const mapRecordToGraphNode = (record: NodeRecord): GraphNode => ({
  labels: record.labels,
  properties: {
    uuid: record.properties.uuid,
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
