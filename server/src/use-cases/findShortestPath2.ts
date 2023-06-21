import { findRelationships, findShortestPath as shortestPathFinder } from "../gateways/neo4j/neo4j.gateway";
import { GraphLink, GraphNode } from "../models/models";

export const findShortestPath = async ({
  isDirected,
  sourceUuid,
  targetUuid,
}: {
  isDirected?: boolean;
  sourceUuid: string;
  targetUuid: string;
}): Promise<{
  links: GraphLink[];
  nodes: GraphNode[];
}> => {
  const { nodes, links: pathLinks } = await shortestPathFinder({ isDirected, sourceUuid, targetUuid });
  const links = await findRelationships({ links: pathLinks, isDirected });
  return { nodes, links };
};
