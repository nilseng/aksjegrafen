import { uniqWith } from "lodash";
import { findInvestments, findInvestors, findRoleHolders, findRoleUnits } from "../gateways/neo4j/neo4j.gateway";
import { GraphLinkType, GraphNode, Year } from "../models/models";
import { addCurrentRoles } from "../utils/addCurrentRoles";

export const findNeighbours = async ({
  uuid,
  linkTypes,
  year,
  limit,
}: {
  uuid: string;
  linkTypes?: GraphLinkType[];
  year: Year;
  limit: number;
}) => {
  const [investors, investments, holders, units] = await Promise.all([
    shouldIncludeLinkType(GraphLinkType.OWNS, linkTypes) ? findInvestors({ uuid, year, limit }) : emptyGraphResponse,
    shouldIncludeLinkType(GraphLinkType.OWNS, linkTypes) ? findInvestments({ uuid, year, limit }) : emptyGraphResponse,
    // Assumes roles and units should be returned if there are multiple link types
    // TODO: Check actual link types
    shouldIncludeLinkType(GraphLinkType.UNKNOWN, linkTypes) ? findRoleHolders({ uuid, limit }) : emptyGraphResponse,
    shouldIncludeLinkType(GraphLinkType.UNKNOWN, linkTypes) ? findRoleUnits({ uuid, limit }) : emptyGraphResponse,
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
  addSourceSkip({
    uuid,
    nodes: uniqueNodes,
    skip: {
      actors: holders.nodes.length ? holders.nodes.length - 1 : 0,
      units: units.nodes.length ? units.nodes.length - 1 : 0,
      investors: investors.nodes.length ? investors.nodes.length - 1 : 0,
      investments: investments.nodes.length ? investments.nodes.length - 1 : 0,
    },
  });
  addCurrentRoles({ nodes: uniqueNodes, links: uniqueLinks });
  return {
    nodes: uniqueNodes,
    links: uniqueLinks,
  };
};

const addSourceSkip = ({ uuid, nodes, skip }: { uuid: string; nodes: GraphNode[]; skip: GraphNode["skip"] }) => {
  const source = nodes.find((node) => node.properties.uuid === uuid);
  if (!source) throw Error(`Source node with uuid=${uuid} not found.`);
  source.skip = skip;
};

const shouldIncludeLinkType = (type: GraphLinkType, linkTypes?: GraphLinkType[]) => {
  if (!linkTypes || linkTypes.length === 0) return true;
  if (linkTypes.includes(type)) return true;
  if (type !== GraphLinkType.OWNS && linkTypes.filter((t) => t !== GraphLinkType.OWNS).length > 0) return true;
  return false;
};

const emptyGraphResponse = {
  nodes: [],
  links: [],
};
