import { findRoleUnits as roleUnitFinder } from "../gateways/neo4j/neo4j.gateway";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findRoleUnits = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) => {
  const units = await roleUnitFinder({ uuid, limit, skip });
  addCurrentRoles(units);
  return units;
};
