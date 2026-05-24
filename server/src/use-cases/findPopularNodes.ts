import { findNodesByUuids } from "../gateways/neo4j/neo4j.gateway";
import { getEventCountByUuid } from "../gateways/userEvent/userEvent.gateway";
import { GraphNode } from "../models/models";

export const findPopularNodes = async () => {
  const nodeCounts = await getEventCountByUuid();
  const nodes = await findNodesByUuids({ uuids: nodeCounts.map((c) => c.uuid) });
  const sortedNodes: GraphNode[] = [];
  nodeCounts.forEach((count) => {
    // Events are keyed by node uuid, but a node can disappear from the graph (e.g. after a
    // graph reload assigns fresh uuids). Skip counts whose node no longer exists rather than
    // pushing undefined, which would serialize to null and crash the client's result mapper.
    const node = nodes.find((n) => n.properties.uuid === count.uuid);
    if (node) sortedNodes.push(node);
  });
  return sortedNodes;
};
