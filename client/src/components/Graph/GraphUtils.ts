import React, { useLayoutEffect } from "react";
import {
  select,
  zoom,
  forceSimulation,
  SimulationNodeDatum,
  Simulation,
  forceCollide,
  forceLink,
  zoomIdentity,
  zoomTransform,
  forceY,
  forceX,
  forceManyBody,
} from "d3";
import { ICompany, IOwnership, IShareholder } from "../../models/models";

export const useZoom = (
  setSvgTranslate: React.Dispatch<React.SetStateAction<string>>,
  resetZoom: boolean,
  setResetZoom: React.Dispatch<React.SetStateAction<boolean>>,
  svgEl?: React.RefObject<SVGSVGElement>
) => {
  useLayoutEffect(() => {
    const zoomed = (transform: any) => {
      setSvgTranslate(`translate(${transform.x},${transform.y}) scale(${transform.k})`);
    };

    if (svgEl) {
      const svg: any = select(svgEl.current);
      if (resetZoom) {
        const z = zoom().on("zoom", (e) => zoomed(e.transform));
        svg.call(z.transform, zoomIdentity, zoomTransform(svg.node()).invert([0, 0]));
        setResetZoom(false);
      } else {
        const z = zoom().on("zoom", (e) => zoomed(e.transform));
        svg.call(z);
      }
    }
  }, [resetZoom, setResetZoom, setSvgTranslate, svgEl]);
};

type ISimulationNodeDatum = {
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

// Used to differ between ForceSimulationNode and SimpleTreeNode. Update if strict type guard is needed
export const isGraphNode = (o: any): o is IGraphNode => {
  return o && o.id && o.entity;
};

export const isSimpleTreeNode = (o: any): o is ISimpleTreeNode => {
  return o && o.data;
};

export const getNodeIdFromEntity = (entity: ICompany | IShareholder): string => {
  return entity.orgnr ?? (entity as IShareholder).id;
};

const getNodeIdFromOwnership = (o: IOwnership): string | undefined => {
  return o.company?.orgnr ?? o.shareholder?.orgnr ?? o.shareholder?.id;
};

export const initializeGraphSimulation = (
  dimensions: IGraphDimensions,
  entity: IShareholder | ICompany,
  investors?: IOwnership[],
  investments?: IOwnership[]
) => {
  const centerNode: IGraphNode = {
    id: entity.orgnr ?? (entity as IShareholder).id,
    entity,
    ...getGraphCenter(dimensions),
    ...dimensions.nodeDimensions,
    skipInvestors: investors?.length,
    skipInvestments: investments?.length,
  };
  const newOwnerships: (IOwnership & { yForce: number })[] = [
    ...(investors?.map((inv) => ({ ...inv, yForce: centerNode.y - centerNode.height })) ?? []),
    ...(investments?.map((inv) => ({ ...inv, yForce: centerNode.y + centerNode.height })) ?? []),
  ];
  return graphSimulation(dimensions, newOwnerships, centerNode);
};

const getGraphCenter = (dimensions: IGraphDimensions) => {
  return {
    x: dimensions.width / 2 - dimensions.nodeDimensions.width / 2,
    y: dimensions.height / 2 - dimensions.nodeDimensions.height / 2,
  };
};

export const graphSimulation = (
  dimensions: INodeDimensions,
  newOwnerships: (IOwnership & { yForce?: number })[],
  activeNode: IGraphNode,
  currentNodes?: IGraphNode[],
  currentLinks?: IGraphLink[],
  yForce?: number
) => {
  // Fixing the clicked node to current position
  const inputNodes = currentNodes
    ? currentNodes?.map((n) => {
        if (n.id === activeNode?.id) {
          n.fx = n.x;
          n.fy = n.y;
        }
        return n;
      })
    : [{ ...activeNode, fx: activeNode.x, fy: activeNode.y }];
  const nodeDatums = createNodeDatums(newOwnerships, dimensions, inputNodes);
  const simulation = forceSimulation<ISimulationNodeDatum, IGraphLink>()
    .nodes(nodeDatums)
    .force("charge", forceManyBody().strength(-20))
    .force("collide", forceCollide(200)) as Simulation<IGraphNode, IGraphLink>;

  const nodes = simulation.nodes();
  const links = updateLinks(newOwnerships, currentLinks, nodes);

  simulation
    .force("link", forceLink(links).strength(0.05)) // Using x and y forces to keep nodes in current position if possible, doesn't seem to have much effect...
    .force(
      "y",
      forceY()
        .y((d: any) => {
          if (d.isNew) {
            d.isNew = false;
            // TODO: Figure out an accurate number for the offset
            return d.yForce ?? yForce ?? d.y + dimensions.height / 2;
          } else {
            return d.yForce ?? d.y + dimensions.height / 2;
          }
        })
        .strength(10)
    )
    .force(
      "x",
      forceX()
        .x((d: any) => {
          if (d.isNew) {
            d.isNew = false;
            // TODO: Figure out an accurate number for the offset
            return activeNode.x + dimensions.width / 3;
          } else {
            return d.x + dimensions.width / 3;
          }
        })
        .strength(10)
    )
    .tick(1000);

  for (const node of nodes) {
    delete node.fx;
    delete node.fy;
  }

  return { simulation, nodes: simulation.nodes(), links };
};

const createNodeDatums = (
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

const updateLinks = (ownerships: IOwnership[], currentLinks?: IGraphLink[], nodes?: IGraphNode[]): IGraphLink[] => {
  const links = currentLinks ?? [];

  // Making sure links have the most recent nodes. Could possibly be removed when useSimpleTree is.
  for (const link of links) {
    link.source = nodes?.find((n) => n.id === link.source.id) ?? link.source;
    link.target = nodes?.find((n) => n.id === link.target.id) ?? link.target;
  }

  const currentOwnerships = links.map((link) => link.ownerships).flat();
  for (const o of ownerships) {
    // If the ownership is already in the graph, do nothing
    if (currentOwnerships.find((c) => c._id === o._id)) {
      console.log("ownership already in graph", o);
      continue;
    }

    const sourceId = o.shareholderOrgnr ?? o.shareHolderId;
    const targetId = o.orgnr;
    const source = nodes?.find((node) => node.id === sourceId);
    const target = nodes?.find((node) => node.id === targetId);
    if (!source || !target) {
      console.error("Something went wrong when updating links - source or target not found.");
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

export interface IGraphDimensions {
  width: number;
  height: number;
  nodeMargins: {
    horisontal: number;
    vertical: number;
  };
  nodeDimensions: INodeDimensions;
}

export type ISimpleTreeNode = d3.HierarchyPointNode<ISimpleTreeDatum>;

interface ISimpleTreeDatum {
  id: string;
  entity: ICompany | IShareholder;
  children?: ISimpleTreeDatum[];
  width: number;
  height: number;
}
