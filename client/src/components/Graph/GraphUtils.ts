import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  select,
  zoom,
  forceSimulation,
  SimulationNodeDatum,
  Simulation,
  forceCollide,
  tree,
  hierarchy,
  forceLink,
  zoomIdentity,
  zoomTransform,
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
      setSvgTranslate(
        `translate(${transform.x},${transform.y}) scale(${transform.k})`
      );
    };

    if (svgEl) {
      const svg: any = select(svgEl.current);
      if (resetZoom) {
        const z = zoom().on("zoom", (e) => zoomed(e.transform));
        svg.call(
          z.transform,
          zoomIdentity,
          zoomTransform(svg.node()).invert([0, 0])
        );
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

export const graphSimulation = (
  dimensions: INodeDimensions,
  newOwnerships: IOwnership[],
  currentNodes?: IGraphNode[],
  currentLinks?: IGraphLink[]
) => {
  const nodeDatums = createNodeDatums(newOwnerships, dimensions, currentNodes);
  const simulation = forceSimulation<ISimulationNodeDatum, IGraphLink>()
    .nodes(nodeDatums)
    .force("collide", forceCollide(200)) as Simulation<IGraphNode, IGraphLink>;

  const nodes = simulation.nodes();
  const links = updateLinks(newOwnerships, currentLinks, nodes);

  simulation.force("link", forceLink(links)).tick(1000);

  return { simulation, nodes: simulation.nodes(), links };
};

const createNodeDatums = (
  ownerships: IOwnership[],
  dimensions: INodeDimensions,
  currentNodes?: IGraphNode[]
) => {
  const newDatums: ({
    id: string;
    entity: ICompany | IShareholder;
  } & INodeDimensions)[] = [];
  for (const o of ownerships) {
    const identifier =
      o.company?.orgnr ?? o.shareholder?.orgnr ?? o.shareholder?.id;
    if (!identifier) {
      console.error("Entity identifier not found in:", o);
      continue;
    }
    // If datum exists in graph or in unfilteredDatums, do nothing
    if (
      currentNodes?.find((n) => n.id === identifier) ||
      newDatums.find((d) => d.id === identifier)
    ) {
      continue;
    }
    newDatums.push(
      o.company
        ? { entity: o.company, id: identifier, ...dimensions }
        : {
            entity: o.shareholder as IShareholder,
            id: identifier,
            ...dimensions,
          }
    );
  }

  const nodeDatums = currentNodes ? [...newDatums, ...currentNodes] : newDatums;

  return nodeDatums;
};

const updateLinks = (
  ownerships: IOwnership[],
  currentLinks?: IGraphLink[],
  nodes?: IGraphNode[]
): IGraphLink[] => {
  const links = currentLinks ? [...currentLinks] : [];
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
      console.error(
        "Something went wrong when updating links - source or target not found."
      );
      continue;
    }
    const link = links.find(
      (l) => l.source.id === sourceId && l.target.id === targetId
    );
    if (link) link.ownerships.push(o);
    else {
      links.push({ source, target, ownerships: [o] });
    }
    source.loadedInvestments = source.loadedInvestments
      ? source.loadedInvestments + 1
      : 1;
    target.loadedInvestors = target.loadedInvestors
      ? target.loadedInvestors + 1
      : 1;
  }

  return links;
};

export interface ITreeDimensions {
  width: number;
  height: number;
  nodeMargins: {
    horisontal: number;
    vertical: number;
  };
  nodeDimensions: INodeDimensions;
}

export type ISimpleTreeNode = d3.HierarchyPointNode<ISimpleTreeDatum> & {
  fx?: number;
  fy?: number;
};

interface ISimpleTreeDatum {
  id: string;
  entity: ICompany | IShareholder;
  children?: ISimpleTreeDatum[];
  width: number;
  height: number;
}

export const useSimpleTree = (
  treeConfig: ITreeDimensions,
  entity?: ICompany | IShareholder,
  investors?: IOwnership[],
  investments?: IOwnership[]
) => {
  const [creatingInvestorNodes, setCreatingInvestorNodes] =
    useState<boolean>(false);
  const [creatingInvestmentNodes, setCreatingInvestmentNodes] =
    useState<boolean>(false);
  const [creatingTree, setCreatingTree] = useState<boolean>(false);

  const [nodes, setNodes] = useState<IGraphNode[]>();
  const [links, setLinks] = useState<IGraphLink[]>();

  const [investorNodes, setInvestorNodes] = useState<IGraphNode[]>();
  const [investorLinks, setInvestorLinks] = useState<IGraphLink[]>();
  const [investmentNodes, setInvestmentNodes] = useState<IGraphNode[]>();
  const [investmentLinks, setInvestmentLinks] = useState<IGraphLink[]>();

  // Creating investor tree
  useEffect(() => {
    if (entity && investors) {
      setCreatingInvestorNodes(true);
      const investorTree = tree<ISimpleTreeDatum>();
      investorTree.size([treeConfig.width, treeConfig.height]);
      investorTree.nodeSize([
        treeConfig.nodeDimensions.width + treeConfig.nodeMargins.horisontal,
        treeConfig.nodeDimensions.height + treeConfig.nodeMargins.vertical,
      ]);
      const investorDatums = createInvestorDatums(
        investors,
        treeConfig,
        entity
      );
      const root: ISimpleTreeNode = investorTree(
        hierarchy<ISimpleTreeDatum>({
          id: entity.orgnr ?? (entity as IShareholder).id,
          entity,
          width: treeConfig.nodeDimensions.width,
          height: treeConfig.nodeDimensions.height,
          children: investorDatums,
        })
      );

      const treeNodes = root.descendants();

      // Centering tree, turning it "upside down" and adding top margin
      treeNodes.forEach((node) => {
        node.x += treeConfig.width / 2 - treeConfig.nodeDimensions.width / 2;
        node.y =
          treeConfig.height -
          node.y -
          treeConfig.height / 2 -
          treeConfig.nodeDimensions.height / 2;
        // Adding fx and fy in order to fix the nodes to position when using them in force simulation
        node.fx = node.x;
        node.fy = node.y;
      });

      const graphNodes = mapToGraphNodes(treeNodes);
      const links: IGraphLink[] = [];

      const targetId = entity.orgnr;
      const target = graphNodes.find((node) => node.id === targetId);
      if (!target) return;
      target.skipInvestors = investors.length;
      target.loadedInvestors = investors.length;
      target.loadedInvestments = investments?.length;
      for (const inv of investors) {
        const sourceId = inv.shareholderOrgnr ?? inv.shareHolderId;
        const source = graphNodes.find((node) => node.id === sourceId);
        if (source && target) {
          if (source.loadedInvestments) source.loadedInvestments += 1;
          else source.loadedInvestments = 1;
          const link = links.find(
            (link) => link.source.id === sourceId && link.target.id === targetId
          );
          if (link) link.ownerships.push(inv);
          else links.push({ source, target, ownerships: [inv] });
        }
      }

      setInvestorLinks(links);
      setInvestorNodes(graphNodes);
      setCreatingInvestorNodes(false);
    }
    return () => {
      setInvestorNodes(undefined);
      setInvestorLinks(undefined);
    };
  }, [treeConfig, entity, investors, investments]);

  // Creating investment tree
  useEffect(() => {
    if (entity && investments) {
      setCreatingInvestmentNodes(true);
      const investmentTree = tree<ISimpleTreeDatum>();
      investmentTree.size([treeConfig.width, treeConfig.height]);
      investmentTree.nodeSize([
        treeConfig.nodeDimensions.width + treeConfig.nodeMargins.horisontal,
        treeConfig.nodeDimensions.height + treeConfig.nodeMargins.vertical,
      ]);

      const investmentDatums = createInvestmentDatums(
        investments,
        treeConfig,
        entity
      );
      const root: ISimpleTreeNode = investmentTree(
        hierarchy<ISimpleTreeDatum>({
          id: entity.orgnr ?? (entity as IShareholder).id,
          entity,
          width: treeConfig.nodeDimensions.width,
          height: treeConfig.nodeDimensions.height,
          children: investmentDatums,
        })
      );

      const treeNodes: ISimpleTreeNode[] = root.descendants();

      // Aligning company tree with shareholder tree
      treeNodes.forEach((node) => {
        node.x += treeConfig.width / 2 - treeConfig.nodeDimensions.width / 2;
        node.y =
          node.y + treeConfig.height / 2 - treeConfig.nodeDimensions.height / 2;
        // Adding fx and fy in order to fix the nodes to position when using them in force simulation
        node.fx = node.x;
        node.fy = node.y;
      });

      const graphNodes = mapToGraphNodes(treeNodes);
      const links: IGraphLink[] = [];

      const source = graphNodes.find(
        (node) =>
          node.id === entity.orgnr || node.id === (entity as IShareholder).id
      );
      if (!source) return;
      source.skipInvestments = investments.length;
      source.loadedInvestors = investors?.length;
      source.loadedInvestments = investments.length;
      for (const inv of investments) {
        const targetId = inv.orgnr;
        const target = graphNodes.find((node) => node.id === targetId);
        if (source && target) {
          if (target.loadedInvestors) target.loadedInvestors += 1;
          else target.loadedInvestors = 1;
          const link = links.find(
            (link) =>
              link.source.id === source.id && link.target.id === targetId
          );
          if (link) link.ownerships.push(inv);
          else links.push({ source, target, ownerships: [inv] });
        }
      }

      setInvestmentLinks(links);
      setInvestmentNodes(graphNodes);
      setCreatingInvestmentNodes(false);
    }
    return () => {
      setInvestmentNodes(undefined);
      setInvestmentLinks(undefined);
    };
  }, [investments, investors, entity, treeConfig]);

  useEffect(() => {
    if (investorNodes && investmentNodes) {
      const centerInvestorNode = investorNodes[0];
      const centerInvestmentNode = investmentNodes[0];
      // Merging the 'center nodes' in order to get both skipInvestors and skipInvestments
      const centerNode = { ...centerInvestorNode, ...centerInvestmentNode };
      setNodes([
        centerNode,
        ...investmentNodes.slice(1),
        ...investorNodes.slice(1),
      ]);
    } else if (investorNodes) setNodes(investorNodes);
    else if (investmentNodes) setNodes(investmentNodes);
  }, [investmentNodes, investorNodes]);

  useEffect(() => {
    if (investorLinks && investmentLinks)
      setLinks([...investorLinks, ...investmentLinks]);
    else if (investorLinks) setLinks(investorLinks);
    else if (investmentLinks) setLinks(investmentLinks);
  }, [investmentLinks, investorLinks]);

  useEffect(() => {
    setCreatingTree(creatingInvestmentNodes || creatingInvestorNodes);
  }, [creatingInvestmentNodes, creatingInvestorNodes]);

  return {
    nodes,
    links,
    creatingTree,
    investorNodes,
    investorLinks,
    setInvestorLinks,
    investmentNodes,
    investmentLinks,
    setInvestmentLinks,
  };
};

const createInvestorDatums = (
  o: IOwnership[],
  nodeDimensions: INodeDimensions,
  entity: ICompany | IShareholder
): ISimpleTreeDatum[] => {
  const ownershipsWithEntity = o.filter(
    (o) =>
      (o.company && o.company.orgnr !== entity.orgnr) ||
      (o.shareholder && o.shareholder.id !== (entity as IShareholder).id)
  );
  const uniqueIds = new Set(
    ownershipsWithEntity.map((o) => o.shareholderOrgnr ?? o.shareHolderId)
  );
  const uniqueOwnerships: IOwnership[] = [];
  for (const id of Array.from(uniqueIds)) {
    uniqueOwnerships.push(
      ownershipsWithEntity.find(
        (o) => o.shareholderOrgnr === id || o.shareHolderId === id
      ) as IOwnership
    );
  }
  return uniqueOwnerships.map((o) => ({
    entity: (o.company ?? o.shareholder) as ICompany | IShareholder,
    id: o.shareholderOrgnr ?? o.shareHolderId,
    ...nodeDimensions,
  }));
};

const createInvestmentDatums = (
  o: IOwnership[],
  nodeDimensions: INodeDimensions,
  entity: ICompany | IShareholder
): ISimpleTreeDatum[] => {
  const ownershipsWithCompany = o.filter(
    (o) => o.company && o.company.orgnr !== entity.orgnr
  );
  const uniqueOrgnrs = new Set(
    ownershipsWithCompany.map((o) => o.company?.orgnr as string)
  );
  const uniqueOwnerships: IOwnership[] = [];
  for (const orgnr of Array.from(uniqueOrgnrs)) {
    uniqueOwnerships.push(
      ownershipsWithCompany.find(
        (o) => o.company?.orgnr === orgnr
      ) as IOwnership
    );
  }
  return uniqueOwnerships.map((o) => ({
    entity: o.company as ICompany,
    id: o.orgnr,
    ...nodeDimensions,
  }));
};

const mapToGraphNodes = (treeNodes: ISimpleTreeNode[]): IGraphNode[] => {
  const filteredNodes = treeNodes.filter((node) => node.data.entity);
  const graphNodes = filteredNodes.map((treeNode) => {
    return {
      id: treeNode.data.id,
      entity: treeNode.data.entity,
      x: treeNode.x,
      y: treeNode.y,
      fx: treeNode.fx,
      fy: treeNode.fy,
      width: treeNode.data.width,
      height: treeNode.data.height,
    };
  });
  return graphNodes.filter((node) => isGraphNode(node));
};
