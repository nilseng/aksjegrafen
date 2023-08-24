import { findNodesByUuids } from "../gateways/neo4j/neo4j.gateway";
import { getEventCountByUuid } from "../gateways/userEvent/userEvent.gateway";
import { GraphNode } from "../models/models";

export const findPopularNodes = async () => {
  const nodeCounts = await getEventCountByUuid();
  const nodes = await findNodesByUuids({ uuids: nodeCounts.map((c) => c.uuid) });
  const sortedNodes: GraphNode[] = [];
  nodeCounts.forEach((count) => {
    sortedNodes.push(nodes.find((n) => n.properties.uuid === count.uuid)!);
  });
  return sortedNodes;
};
