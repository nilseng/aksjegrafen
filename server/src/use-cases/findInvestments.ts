import { findInvestments as investmentsFinder } from "../gateways/neo4j/neo4j.gateway";
import { Year } from "../models/models";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findInvestments = async ({
  uuid,
  year,
  limit,
  skip,
}: {
  uuid: string;
  year: Year;
  limit: number;
  skip: number;
}) => {
  const investments = await investmentsFinder({ uuid, year, limit, skip });
  addCurrentRoles(investments);
  return investments;
};
