import { findOwnershipChains } from "../gateways/neo4j/neo4j.gateway";
import { Year } from "../models/models";

export const findInvestorChains = async ({
  investorUuid,
  targetUuid,
  year,
  maxDepth,
  limit,
}: {
  investorUuid: string;
  targetUuid: string;
  year: Year;
  maxDepth: number;
  limit: number;
}) => {
  return findOwnershipChains({ investorUuid, targetUuid, year, maxDepth, limit });
};
