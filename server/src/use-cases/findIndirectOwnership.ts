import { findIndirectInvestors } from "../gateways/neo4j/neo4j.gateway";
import { Year } from "../models/models";

export const findIndirectOwnership = async ({
  uuid,
  orgnr,
  year,
  maxDepth,
  minShare,
  limit,
  skip,
}: {
  uuid?: string;
  orgnr?: string;
  year: Year;
  maxDepth: number;
  minShare: number;
  limit: number;
  skip: number;
}) => {
  return findIndirectInvestors({ uuid, orgnr, year, maxDepth, minShare, limit, skip });
};
