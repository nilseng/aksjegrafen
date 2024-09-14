import { findAllPaths as allPathsFinder, findRelationships } from "../gateways/neo4j/neo4j.gateway";
import { GraphLink, GraphLinkType, GraphNode } from "../models/models";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findAllPaths = async ({
  isDirected,
  sourceUuid,
  targetUuid,
  linkTypes,
  limit,
}: {
  isDirected?: boolean;
  sourceUuid: string;
  targetUuid: string;
  linkTypes?: GraphLinkType[];
  limit: number;
}): Promise<{
  links: GraphLink[];
  nodes: GraphNode[];
}> => {
  const { links: pathLinks, nodes } = await allPathsFinder({
    isDirected,
    sourceUuid,
    targetUuid,
    linkTypes: linkTypes && linkTypes?.length > 0 ? linkTypes : undefined,
    limit,
  });
  const links = await findRelationships({ links: pathLinks, isDirected });
  addCurrentRoles({ nodes, links });
  return { links, nodes };
};
