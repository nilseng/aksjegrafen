import { findInvestments, findInvestors, findRoleHolders, findRoleUnits } from "../gateways/neo4j.gateway";

export const findNeighbours = async ({ uuid, limit }: { uuid: string; limit: number }) => {
  const [investors, investments, holders, units] = await Promise.all([
    findInvestors({ uuid, limit }),
    findInvestments({ uuid, limit }),
    findRoleHolders({ uuid, limit }),
    findRoleUnits({ uuid, limit }),
  ]);
  return {
    investors,
    investments,
    holders,
    units,
  };
};
