import { findInvestments as investmentsFinder } from "../gateways/neo4j/neo4j.gateway";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findInvestments = async ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) => {
  const investments = await investmentsFinder({ uuid, limit, skip });
  addCurrentRoles(investments);
  return investments;
};
