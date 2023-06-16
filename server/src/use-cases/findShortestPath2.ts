import { findShortestPath as shortestPathFinder } from "../gateways/neo4j/neo4j.gateway";

export const findShortestPath = ({ sourceUuid, targetUuid }: { sourceUuid: string; targetUuid: string }) =>
  shortestPathFinder({ sourceUuid, targetUuid });
