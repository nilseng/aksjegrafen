import { findAllPaths as allPathsFinder, findRelationships } from "../gateways/neo4j/neo4j.gateway";

export const findAllPaths = async (params: { sourceUuid: string; targetUuid: string; limit: number }) => {
  const { links: pathLinks, nodes } = await allPathsFinder(params);
  const links = await findRelationships(pathLinks);
  return { links, nodes };
};
