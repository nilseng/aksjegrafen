import { searchNode as nodeSearcher } from "../gateways/neo4j/neo4j.gateway";

export const searchNode = ({ searchTerm, limit }: { searchTerm: string; limit: 10 }) =>
  nodeSearcher({ searchTerm, limit });
