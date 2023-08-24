import { findNodesByUuids } from "../gateways/neo4j/neo4j.gateway";
import { getEventCountByUuid } from "../gateways/userEvent/userEvent.gateway";

export const findPopularNodes = async () => {
  const nodeCounts = await getEventCountByUuid();
  const nodes = await findNodesByUuids({ uuids: nodeCounts.map((c) => c.uuid) });
  // TODO: Sort nodes based on count
  return nodes;
};
