import { findAllPaths as allPathsFinder } from "../gateways/neo4j/neo4j.gateway";

export const findAllPaths = (params: { sourceUuid: string; targetUuid: string; limit: number }) =>
  allPathsFinder(params);
