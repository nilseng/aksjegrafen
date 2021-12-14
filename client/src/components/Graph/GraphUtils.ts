import { SimulationNodeDatum } from "d3";
import { ICompany, IOwnership, IShareholder } from "../../models/models";

export type ISimulationNodeDatum = {
  id: string;
  entity: ICompany | IShareholder;
} & INodeDimensions &
  SimulationNodeDatum;

export type IGraphNode = {
  x: number;
  y: number;
  loadedInvestors?: number;
  skipInvestors?: number;
  loadedInvestments?: number;
  skipInvestments?: number;
} & ISimulationNodeDatum;

export interface INodeDimensions {
  width: number;
  height: number;
}

export interface IGraphLink {
  index?: number;
  source: IGraphNode;
  target: IGraphNode;
  ownerships: IOwnership[];
}

export interface IGraphDimensions {
  width: number;
  height: number;
  nodeDimensions: INodeDimensions;
}

export const getNodeIdFromEntity = (entity: ICompany | IShareholder): string => {
  return entity.orgnr ?? (entity as IShareholder).id;
};

export const getNodeIdFromOwnership = (o: IOwnership): string | undefined => {
  return o.company?.orgnr ?? o.shareholder?.orgnr ?? o.shareholder?.id;
};

export const getGraphCenter = (dimensions: IGraphDimensions) => {
  return {
    x: dimensions.width / 2 - dimensions.nodeDimensions.width / 2,
    y: dimensions.height / 2 - dimensions.nodeDimensions.height / 2,
  };
};

export const createNodeDatums = (
  ownerships: (IOwnership & { yForce?: number })[],
  dimensions: INodeDimensions,
  currentNodes?: IGraphNode[]
) => {
  const newDatums: ({
    id: string;
    entity: ICompany | IShareholder;
    isNew?: boolean;
    yForce?: number;
  } & INodeDimensions)[] = [];
  for (const o of ownerships) {
    const identifier = getNodeIdFromOwnership(o);
    if (!identifier) {
      console.error("Entity identifier not found in:", o);
      continue;
    }
    // If datum exists in graph or in unfilteredDatums, do nothing
    if (currentNodes?.find((n) => n.id === identifier) || newDatums.find((d) => d.id === identifier)) {
      continue;
    }
    newDatums.push(
      o.company
        ? { entity: o.company, id: identifier, ...dimensions, isNew: true, yForce: o.yForce }
        : {
            entity: o.shareholder as IShareholder,
            id: identifier,
            ...dimensions,
            isNew: true,
            yForce: o.yForce,
          }
    );
  }

  const nodeDatums = currentNodes ? [...newDatums, ...currentNodes] : newDatums;

  return nodeDatums;
};

export const updateLinks = (
  ownerships: IOwnership[],
  nodes: IGraphNode[],
  currentLinks?: IGraphLink[]
): IGraphLink[] => {
  const links = currentLinks ?? [];

  const currentOwnerships = links.map((link) => link.ownerships).flat();
  for (const o of ownerships) {
    // If the ownership is already in the graph, do nothing
    if (currentOwnerships.find((c) => c._id === o._id)) {
      console.info("ownership already in graph", o);
      continue;
    }

    const sourceId = o.shareholderOrgnr ?? o.shareHolderId;
    const targetId = o.orgnr;
    const source = nodes?.find((node) => node.id === sourceId);
    const target = nodes?.find((node) => node.id === targetId);
    if (!source || !target) {
      console.warn("Something went wrong when updating links - source or target not found.");
      continue;
    }
    const link = links.find((l) => l.source.id === sourceId && l.target.id === targetId);
    if (link) link.ownerships.push(o);
    else {
      links.push({ source, target, ownerships: [o] });
    }
    source.loadedInvestments = source.loadedInvestments ? source.loadedInvestments + 1 : 1;
    target.loadedInvestors = target.loadedInvestors ? target.loadedInvestors + 1 : 1;
  }

  return links;
};
