import { findNode as nodeFinder, findNodesByOrgnrs } from "../gateways/neo4j/neo4j.gateway";
import { GraphNodeLabel } from "../models/models";

export const findNode = async ({ uuid, orgnr }: { uuid?: string; orgnr?: string }) => {
  if (uuid) return nodeFinder({ uuid });
  if (orgnr) {
    const nodes = await findNodesByOrgnrs({ orgnrs: [orgnr] });
    return nodes.find((n) => n.labels.includes(GraphNodeLabel.Company)) ?? nodes[0] ?? null;
  }
  return null;
};
