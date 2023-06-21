import { findAllPaths as allPathsFinder, findRelationships } from "../gateways/neo4j/neo4j.gateway";
import { GraphLink, GraphNode } from "../models/models";

export const findAllPaths = async (params: {
  isDirected?: boolean;
  sourceUuid: string;
  targetUuid: string;
  limit: number;
}): Promise<{
  links: GraphLink[];
  nodes: GraphNode[];
}> => {
  const { links: pathLinks, nodes } = await allPathsFinder(params);
  const links = await findRelationships({ links: pathLinks, isDirected: params.isDirected });
  return { links, nodes };
};
