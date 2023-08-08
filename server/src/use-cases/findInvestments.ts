import { findInvestments as investmentsFinder } from "../gateways/neo4j/neo4j.gateway";

export const findInvestments = ({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) =>
  investmentsFinder({ uuid, limit, skip });
