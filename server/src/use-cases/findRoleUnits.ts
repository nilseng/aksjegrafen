import { findRoleUnits as roleUnitFinder } from "../gateways/neo4j/neo4j.gateway";

export const findRoleUnits = ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) =>
  roleUnitFinder({ uuid, limit, skip });
