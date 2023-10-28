import {
  D3DragEvent,
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
  drag,
  forceCollide,
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  select,
} from "d3";
import { cloneDeep } from "lodash";
import { RefObject, useEffect, useRef } from "react";
import { graphConfig } from "../components/Graph/GraphConfig";
import { CurrentRole, GraphLink, GraphNode, GraphType } from "../models/models";
import { openMenu } from "../slices/graphSlice";
import { useAppDispatch } from "../store";
import { useWindowDimensions } from "./useWindowDimensions";

type GraphNodeDatum = GraphNode & SimulationNodeDatum & { id: string };
type GraphLinkDatum = SimulationLinkDatum<GraphNodeDatum> & Pick<GraphLink, "properties" | "type">;

const nodeOffset = {
  x: graphConfig.nodeDimensions.width / 2,
  y: graphConfig.nodeDimensions.height / 2,
};

const getCollisionRadius = (width: number) => {
  if (width <= 768) return Math.max(graphConfig.nodeDimensions.width / 1.5, graphConfig.nodeDimensions.height / 1.5);
  return Math.max(graphConfig.nodeDimensions.width / 1.4, graphConfig.nodeDimensions.height / 1.4);
};

export const useForceSimulation = ({
  nodes,
  links,
  sourceUuid,
  targetUuid,
  graphType,
  svgRef,
}: {
  nodes?: GraphNode[];
  links: GraphLink[];
  sourceUuid?: string;
  targetUuid?: string;
  graphType?: GraphType;
  svgRef: RefObject<SVGSVGElement>;
}) => {
  const dispatch = useAppDispatch();

  const { width } = useWindowDimensions();

  const simulationNodesMap = useRef<{ [uuid: string]: GraphNodeDatum }>({});

  useEffect(() => {
    const svg = svgRef.current ? select<SVGElement, null>(svgRef.current) : undefined;

    if (svg && graphType && nodes && sourceUuid) {
      const mutableNodesMap: { [uuid: string]: GraphNodeDatum } = {};

      cloneDeep(nodes).forEach((node) => {
        mutableNodesMap[node.properties.uuid] = {
          ...simulationNodesMap.current[node.properties.uuid],
          id: node.properties.uuid,
          ...node,
        };
      });

      // TODO: May be undefined. Should not be.
      const source = mutableNodesMap[sourceUuid] as GraphNodeDatum | undefined;

      fixSourcePosition({ node: source, graphType });

      if (targetUuid) fixTargetPosition({ node: mutableNodesMap[targetUuid], graphType });

      const mutableLinks: GraphLinkDatum[] = links.map((link) => ({
        ...link,
        source: mutableNodesMap[(link.source as GraphNodeDatum).properties.uuid],
        target: mutableNodesMap[(link.target as GraphNodeDatum).properties.uuid],
      }));

      const link = svg
        .selectAll(".graph-link")
        .data(
          mutableLinks.filter(
            (l) => (l.source as GraphNodeDatum).properties.uuid !== (l.target as GraphNodeDatum).properties.uuid
          )
        )
        .join(".graph-link");
      const circleLink = svg
        .selectAll(".graph-circle-link")
        .data(
          mutableLinks.filter(
            (l) => (l.source as GraphNodeDatum).properties.uuid === (l.target as GraphNodeDatum).properties.uuid
          )
        )
        .join(".graph-circle-link");
      const linkArrow = svg.selectAll(".graph-link-arrow").data(mutableLinks).join(".graph-link-arrow");
      const linkText = svg.selectAll(".graph-link-text").data(mutableLinks).join(".graph-link-text");

      const simulation = forceSimulation<GraphNodeDatum, GraphLinkDatum>(Object.values(mutableNodesMap))
        .alpha(0.6)
        .alphaDecay(0.05)
        .alphaMin(0.05)
        .force(
          "link",
          forceLink<GraphNodeDatum, GraphLinkDatum>(mutableLinks).id(({ id }) => mutableNodesMap[id].id)
        )
        .force("collide", forceCollide(getCollisionRadius(width)));

      if (graphType === GraphType.Default) addCurrentRoleForces({ simulation, mutableNodesMap });

      const node = svg
        .selectAll<SVGElement, GraphNodeDatum>(".graph-node")
        .data(Object.values(mutableNodesMap))
        .join<SVGElement>(".graph-node")
        .call(handleDrag(simulation))
        .on("click", (e: PointerEvent, d) =>
          dispatch(openMenu({ node: { ...d }, position: { x: e.clientX, y: e.clientY - nodeOffset.y } }))
        );

      simulation.on("tick", () => {
        simulationNodesMap.current = mutableNodesMap;
        node.attr("x", (n) => n.x! - nodeOffset.x).attr("y", (n) => n.y! - nodeOffset.y);
        link
          .attr("x1", (l) => (l.source as GraphNodeDatum).x!)
          .attr("y1", (l) => (l.source as GraphNodeDatum).y!)
          .attr("x2", (l) => (l.target as GraphNodeDatum).x!)
          .attr("y2", (l) => (l.target as GraphNodeDatum).y!);
        circleLink
          .attr("cx", (l) => graphConfig.nodeDimensions.width / 2 + (l.source as GraphNodeDatum).x!)
          .attr("cy", (l) => (l.source as GraphNodeDatum).y!);
        linkArrow.attr("transform", (l) => getLinkArrowTransform(l));
        linkText.attr("transform", (l) => getLinkTextTransform(l));
      });
    }
  }, [nodes, links, graphType, svgRef, targetUuid, sourceUuid, dispatch, width]);
};

const fixSourcePosition = ({ node, graphType }: { node?: GraphNodeDatum; graphType: GraphType }) => {
  if (!node) return;
  if (graphType === GraphType.Default) {
    node.fx = node.fx ?? 0;
    node.fy = node.fy ?? 0;
  }
  if (graphType === GraphType.ShortestPath || graphType === GraphType.AllPaths) {
    node.fx = -(graphConfig.width / 2 - nodeOffset.x);
    node.fy = -(graphConfig.height / 2 - nodeOffset.y);
  }
};

const fixTargetPosition = ({ node, graphType }: { node?: GraphNodeDatum; graphType: GraphType }) => {
  if (!node) return;
  if (graphType === GraphType.ShortestPath || graphType === GraphType.AllPaths) {
    node.fx = graphConfig.width / 2 - nodeOffset.x;
    node.fy = graphConfig.height / 2 - nodeOffset.y;
  }
};

const addCurrentRoleForces = ({
  simulation,
  mutableNodesMap,
}: {
  simulation: Simulation<GraphNodeDatum, GraphLinkDatum>;
  mutableNodesMap: { [uuid: string]: GraphNodeDatum };
}) => {
  simulation.force(
    "actorX",
    forceX<GraphNodeDatum>(
      (d) =>
        (mutableNodesMap[d.sourceUuid ?? ""]?.x ?? 0) -
        (mutableNodesMap[d.sourceUuid ?? ""]?.currentRoles?.includes(CurrentRole.Investment)
          ? graphConfig.nodeDimensions.width
          : 0)
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Actor) ? 1 : 0))
  );
  simulation.force(
    "actorY",
    forceY<GraphNodeDatum>(
      (d) => (mutableNodesMap[d.sourceUuid ?? ""]?.y ?? 0) - graphConfig.nodeDimensions.height
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Actor) ? 1 : 0))
  );
  simulation.force(
    "investorX",
    forceX<GraphNodeDatum>(
      (d) =>
        (mutableNodesMap[d.sourceUuid ?? ""]?.x ?? 0) +
        (mutableNodesMap[d.sourceUuid ?? ""]?.currentRoles?.includes(CurrentRole.Unit)
          ? graphConfig.nodeDimensions.width
          : 0)
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Investor) ? 1 : 0))
  );
  simulation.force(
    "investorY",
    forceY<GraphNodeDatum>(
      (d) => (mutableNodesMap[d.sourceUuid ?? ""]?.y ?? 0) - graphConfig.nodeDimensions.height
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Investor) ? 1 : 0))
  );
  simulation.force(
    "investmentX",
    forceX<GraphNodeDatum>(
      (d) =>
        (mutableNodesMap[d.sourceUuid ?? ""]?.x ?? 0) +
        (mutableNodesMap[d.sourceUuid ?? ""]?.currentRoles?.includes(CurrentRole.Actor)
          ? graphConfig.nodeDimensions.width
          : 0)
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Investment) ? 1 : 0))
  );
  simulation.force(
    "investmentY",
    forceY<GraphNodeDatum>(
      (d) => (mutableNodesMap[d.sourceUuid ?? ""]?.y ?? 0) + graphConfig.nodeDimensions.height
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Investment) ? 1 : 0))
  );
  simulation.force(
    "unitX",
    forceX<GraphNodeDatum>(
      (d) =>
        (mutableNodesMap[d.sourceUuid ?? ""]?.x ?? 0) -
        (mutableNodesMap[d.sourceUuid ?? ""]?.currentRoles?.includes(CurrentRole.Investor)
          ? graphConfig.nodeDimensions.width
          : 0)
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Unit) ? 1 : 0))
  );
  simulation.force(
    "unitY",
    forceY<GraphNodeDatum>(
      (d) => (mutableNodesMap[d.sourceUuid ?? ""]?.y ?? 0) + graphConfig.nodeDimensions.height
    ).strength((d) => (d.currentRoles?.includes(CurrentRole.Unit) ? 1 : 0))
  );
};

const handleDrag = (simulation: Simulation<GraphNodeDatum, GraphLinkDatum>) => {
  function dragstarted(event: D3DragEvent<HTMLElement, any, any>) {
    if (!event.active) simulation.alphaTarget(0.1).restart();
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragged(event: D3DragEvent<HTMLElement, any, any>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: D3DragEvent<HTMLElement, any, any>) {
    if (!event.active) simulation.alphaTarget(0);
  }

  return drag<SVGElement, GraphNodeDatum>().on("start", dragstarted).on("drag", dragged).on("end", dragended);
};

const getLinkArrowTransform = (l: GraphLinkDatum) => {
  const sourcePos = { x: (l.source as GraphNodeDatum).x!, y: (l.source as GraphNodeDatum).y! };
  const targetPos = { x: (l.target as GraphNodeDatum).x!, y: (l.target as GraphNodeDatum).y! };
  const center = {
    x: (sourcePos.x + targetPos.x) / 2,
    y: (sourcePos.y + targetPos.y) / 2,
  };
  const cos_theta =
    (targetPos.y - sourcePos.y) /
    Math.sqrt(Math.pow(targetPos.x - sourcePos.x, 2) + Math.pow(targetPos.y - sourcePos.y, 2));
  const rotation =
    targetPos.x > sourcePos.x
      ? -(Math.acos(cos_theta) / (2 * Math.PI)) * 360
      : (Math.acos(cos_theta) / (2 * Math.PI)) * 360;
  // If all coordinates are 0, cos_theta will be NaN and rotation should not be specified.
  if (isNaN(rotation)) return `translate(${center.x}, ${center.y})`;
  return `translate(${center.x}, ${center.y}) rotate(${rotation})`;
};

const getLinkTextTransform = (l: GraphLinkDatum) => {
  const sourcePos = { x: (l.source as GraphNodeDatum).x!, y: (l.source as GraphNodeDatum).y! };
  const targetPos = { x: (l.target as GraphNodeDatum).x!, y: (l.target as GraphNodeDatum).y! };
  const center = {
    x: (sourcePos.x + targetPos.x) / 2,
    y: (sourcePos.y + targetPos.y) / 2,
  };
  if (sourcePos.x === targetPos.x && sourcePos.y === targetPos.y) return `translate(${center.x + 36}, ${center.y})`;
  return `translate(${center.x - 100}, ${center.y})`;
};
