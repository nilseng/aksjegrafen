import { findRoleHolders } from "../gateways/neo4j/neo4j.gateway";

export const findActors = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) =>
  findRoleHolders({ uuid, limit, skip });
