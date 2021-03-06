import { forceCollide, forceLink, forceSimulation, forceX, forceY, Simulation } from "d3";
import { uniqBy } from "lodash";
import { ICompany, IOwnership, IShareholder } from "../../models/models";
import {
  createNodeDatums,
  getGraphCenter,
  IGraphDimensions,
  IGraphLink,
  IGraphNode,
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
  // Making sure all ownerships are unique (needed in case company has invested in itself)
  const filteredOwnerships = uniqBy(newOwnerships, "_id");
  return graphSimulation(dimensions, filteredOwnerships, centerNode);
};

export const graphSimulation = (
  dimensions: IGraphDimensions,
  newOwnerships: (IOwnership & { yForce?: number })[],
  activeNode: IGraphNode,
  currentNodes?: IGraphNode[],
  currentLinks?: IGraphLink[],
  yForce?: number
) => {
  // Fixing the nodes to current position
  const inputNodes = currentNodes
    ? currentNodes?.map((n) => {
        n.fx = n.x;
        n.fy = n.y;
        return n;
      })
    : [{ ...activeNode, fx: activeNode.x, fy: activeNode.y }];
  const nodeDatums = createNodeDatums(newOwnerships, dimensions, inputNodes);
  const simulation = forceSimulation<ISimulationNodeDatum, IGraphLink>()
    .nodes(nodeDatums)
    .force("collide", forceCollide(200)) as Simulation<IGraphNode, IGraphLink>;

  const nodes = simulation.nodes();
  const links = updateLinks(newOwnerships, nodes, currentLinks);

  simulation
    .force(
      "y",
      forceY()
        .y((d: any) => {
          if (d.isNew) {
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
            // TODO: Figure out an accurate number for the offset
            return activeNode.x;
          } else {
            return d.x;
          }
        })
        .strength(10)
    )
    .force(
      "link",
      forceLink(links)
        .id((d: any) => d.id)
        .distance(0)
        .strength(1)
    )
    .tick(1000);

  simulation.nodes().forEach((n) => {
    n.isNew = false;
  });

  return { simulation, nodes: simulation.nodes(), links };
};
