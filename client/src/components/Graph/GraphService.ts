import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, Simulation } from "d3";
import { ICompany, IOwnership, IShareholder } from "../../models/models";
import {
  createNodeDatums,
  getGraphCenter,
  IGraphDimensions,
  IGraphLink,
  IGraphNode,
  INodeDimensions,
  ISimulationNodeDatum,
  updateLinks,
} from "./GraphUtils";

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
  const links = updateLinks(newOwnerships, nodes, currentLinks);

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
