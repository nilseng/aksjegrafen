import { findNodesByOrgnrs } from "../gateways/neo4j/neo4j.gateway";
import { getEventCountByOrgnr } from "../gateways/userEvent/userEvent.gateway";
import { GraphNode } from "../models/models";

// Popularity is keyed by orgnr, which is stable across graph reloads, rather than by node
// uuid, which is regenerated on every reload (and so leaves the popular list empty afterwards).
export const findPopularNodes = async () => {
  const orgnrCounts = await getEventCountByOrgnr();
  const nodes = await findNodesByOrgnrs({ orgnrs: orgnrCounts.map((c) => c.orgnr) });
  const sortedNodes: GraphNode[] = [];
  orgnrCounts.forEach((count) => {
    const node = nodes.find((n) => n.properties.orgnr === count.orgnr);
    if (node) sortedNodes.push(node);
  });
  return sortedNodes;
};
