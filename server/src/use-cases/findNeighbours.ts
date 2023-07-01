import { uniqWith } from "lodash";
import { findInvestments, findInvestors, findRoleHolders, findRoleUnits } from "../gateways/neo4j/neo4j.gateway";

export const findNeighbours = async ({ uuid, limit }: { uuid: string; limit: number }) => {
  const [investors, investments, holders, units] = await Promise.all([
    findInvestors({ uuid, limit }),
    findInvestments({ uuid, limit }),
    findRoleHolders({ uuid, limit }),
    findRoleUnits({ uuid, limit }),
  ]);
  return {
    nodes: uniqWith(
      [...investors.nodes, ...investments.nodes, ...holders.nodes, ...units.nodes],
      (a, b) => a.properties.uuid === b.properties.uuid
    ),
    links: uniqWith(
      [...investors.links, ...investments.links, ...holders.links, ...units.links],
      (a, b) =>
        a.source.properties.uuid === b.source.properties.uuid && a.target.properties.uuid === b.target.properties.uuid
    ),
  };
};
