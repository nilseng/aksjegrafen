import { CurrentRole, GraphLink, GraphNode } from "../models/models";

export const addCurrentRoles = ({ nodes, links }: { nodes: GraphNode[]; links: GraphLink[] }) => {
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
