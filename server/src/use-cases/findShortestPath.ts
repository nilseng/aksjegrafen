import { findRelationships, findShortestPath as shortestPathFinder } from "../gateways/neo4j/neo4j.gateway";
import { GraphLink, GraphLinkType, GraphNode } from "../models/models";

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
}): Promise<{
  links: GraphLink[];
  nodes: GraphNode[];
}> => {
  const { nodes, links: pathLinks } = await shortestPathFinder({
    isDirected,
    sourceUuid,
    targetUuid,
    linkTypes: linkTypes && linkTypes?.length > 0 ? linkTypes : undefined,
  });
  const links = await findRelationships({ links: pathLinks, isDirected });
  return { nodes, links };
};
