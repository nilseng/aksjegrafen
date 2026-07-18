import { findIndirectInvestors } from "../gateways/neo4j/neo4j.gateway";
import { Year } from "../models/models";

export const findIndirectOwnership = async ({
  uuid,
  orgnr,
  year,
  minShare,
  personsOnly,
  limit,
  skip,
}: {
  uuid?: string;
  orgnr?: string;
  year: Year;
  minShare: number;
  personsOnly?: boolean;
  limit: number;
  skip: number;
}) => {
  return findIndirectInvestors({ uuid, orgnr, year, minShare, personsOnly, limit, skip });
};
