import { uniqWith } from "lodash";
import { findInvestments, findInvestors, findRoleHolders, findRoleUnits } from "../gateways/neo4j/neo4j.gateway";
import { CurrentRole, GraphLink, GraphNode } from "../models/models";

export const findNeighbours = async ({ uuid, limit }: { uuid: string; limit: number }) => {
  const [investors, investments, holders, units] = await Promise.all([
    findInvestors({ uuid, limit }),
    findInvestments({ uuid, limit }),
    findRoleHolders({ uuid, limit }),
    findRoleUnits({ uuid, limit }),
  ]);
  const uniqueNodes = uniqWith(
    [...investors.nodes, ...investments.nodes, ...holders.nodes, ...units.nodes],
    (a, b) => a.properties.uuid === b.properties.uuid
  );
  const uniqueLinks = uniqWith(
    [...investors.links, ...investments.links, ...holders.links, ...units.links],
    (a, b) =>
      a.source.properties.uuid === b.source.properties.uuid && a.target.properties.uuid === b.target.properties.uuid
  );
  addContextData({ nodes: uniqueNodes, links: uniqueLinks });
  return {
    nodes: uniqueNodes,
    links: uniqueLinks,
  };
};

const addContextData = ({ nodes, links }: { nodes: GraphNode[]; links: GraphLink[] }) => {
  nodes.forEach((node) => {
    const currentRoles = new Set<CurrentRole>();
    const sourceLinks = links.filter((link) => link.source.properties.uuid === node.properties.uuid);
    sourceLinks.forEach((link) => {
      if (link.type === "OWNS") currentRoles?.add(CurrentRole.Investor);
      else currentRoles?.add(CurrentRole.Actor);
    });
    const targetLinks = links.filter((link) => link.target.properties.uuid === node.properties.uuid);
    targetLinks.forEach((link) => {
      if (link.type === "OWNS") currentRoles?.add(CurrentRole.Investment);
      else currentRoles?.add(CurrentRole.Unit);
    });

    node.currentRoles = Array.from(currentRoles);
  });
};
