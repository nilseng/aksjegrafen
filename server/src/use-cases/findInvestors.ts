import { findInvestors as investorsFinder } from "../gateways/neo4j/neo4j.gateway";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findInvestors = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) => {
  const investors = await investorsFinder({ uuid, limit, skip });
  addCurrentRoles(investors);
  return investors;
};
