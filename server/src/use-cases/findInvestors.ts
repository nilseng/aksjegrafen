import { findInvestors as investorsFinder } from "../gateways/neo4j/neo4j.gateway";
import { Year } from "../models/models";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findInvestors = async ({
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
  const investors = await investorsFinder({ uuid, year, limit, skip });
  addCurrentRoles(investors);
  return investors;
};
