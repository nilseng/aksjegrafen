import { findRoleHolders } from "../gateways/neo4j/neo4j.gateway";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findActors = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) => {
  const actors = await findRoleHolders({ uuid, limit, skip });
  addCurrentRoles(actors);
  return actors;
};
