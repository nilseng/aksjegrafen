import { findNode as nodeFinder } from "../gateways/neo4j/neo4j.gateway";

export const findNode = async ({ uuid }: { uuid: string }) => nodeFinder({ uuid });
