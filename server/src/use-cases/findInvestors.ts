import { findInvestors as investorsFinder } from "../gateways/neo4j/neo4j.gateway";

export const findInvestors = ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) =>
  investorsFinder({ uuid, limit, skip });
