import { findShortestPath as shortestPathFinder } from "../gateways/neo4j/neo4j.gateway";

export const findShortestPath = ({
  sourceUuid,
  targetUuid,
  limit,
}: {
  sourceUuid: string;
  targetUuid: string;
  limit: number;
}) => shortestPathFinder({ sourceUuid, targetUuid, limit });
