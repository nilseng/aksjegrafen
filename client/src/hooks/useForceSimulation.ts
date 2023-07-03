import { D3DragEvent, Simulation, drag, forceCollide, forceLink, forceSimulation, forceX, forceY, select } from "d3";
import { cloneDeep } from "lodash";
import { RefObject, useEffect } from "react";
import { graphConfig } from "../components/Graph2/GraphConfig";
import { CurrentRole, GraphLink, GraphNode, GraphType } from "../models/models";
import { GraphLinkDatum, GraphNodeDatum, openMenu } from "../slices/graphSlice";
import { useAppDispatch } from "../store";

const nodeOffset = {
  x: graphConfig.nodeDimensions.width / 2,
  y: graphConfig.nodeDimensions.height / 2,
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
  graphType: GraphType;
  svgRef: RefObject<SVGSVGElement>;
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (svgRef.current && nodes && nodes?.length > 0 && sourceUuid) {
      const svg = select<SVGElement, null>(svgRef.current);

      const mutableNodes: GraphNodeDatum[] = cloneDeep(nodes).map((node) => ({
        id: node.properties.uuid,
        x: 0,
        y: 0,
        ...node,
      }));

      const source = mutableNodes.find((n) => n.properties.uuid === sourceUuid);
      fixSourcePosition({ node: source, graphType });
      if (targetUuid) {
        fixTargetPosition({ node: mutableNodes.find((n) => n.properties.uuid === targetUuid), graphType });
      }

      const mutableLinks: GraphLinkDatum[] = links.map((link) => ({
        ...link,
        source: mutableNodes.find((node) => node.id === (link.source as GraphNodeDatum).properties.uuid)!,
        target: mutableNodes.find((node) => node.id === (link.target as GraphNodeDatum).properties.uuid)!,
      }));

      const link = svg.selectAll(".graph-link").data(mutableLinks).join(".graph-link");
      const linkArrow = svg.selectAll(".graph-link-arrow").data(mutableLinks).join(".graph-link-arrow");

      const simulation = forceSimulation<GraphNodeDatum, GraphLinkDatum>(mutableNodes)
        .alpha(0.4)
        .force(
          "link",
          forceLink<GraphNodeDatum, GraphLinkDatum>(mutableLinks).id(
            ({ id }) => mutableNodes.find((node) => node.id === id) as any
          )
        )
        .force(
          "collide",
          forceCollide(Math.max(graphConfig.nodeDimensions.width / 1.5, graphConfig.nodeDimensions.height / 1.5))
        );

      if (graphType === GraphType.Default) addCurrentRoleForces({ simulation, source });

      const node = svg
        .selectAll<SVGElement, GraphNodeDatum>(".graph-node")
        .data(mutableNodes)
        .join<SVGElement>(".graph-node")
        .call(handleDrag(simulation))
        .on("click", (e: PointerEvent, d) =>
          dispatch(openMenu({ node: { ...d }, position: { x: e.clientX, y: e.clientY - nodeOffset.y } }))
        );

      simulation.on("tick", () => {
        node.attr("x", (n) => n.x! - nodeOffset.x).attr("y", (n) => n.y! - nodeOffset.y);
        link
          .attr("x1", (l) => (l.source as GraphNodeDatum).x!)
          .attr("y1", (l) => (l.source as GraphNodeDatum).y!)
          .attr("x2", (l) => (l.target as GraphNodeDatum).x!)
          .attr("y2", (l) => (l.target as GraphNodeDatum).y!);
        linkArrow.attr("transform", (l) => getLinkArrowTransform(l));
      });
    }
  }, [nodes, links, graphType, svgRef, targetUuid, sourceUuid, dispatch]);
};

const fixSourcePosition = ({ node, graphType }: { node?: GraphNodeDatum; graphType: GraphType }) => {
  if (!node) return;
  if (graphType === GraphType.Default) {
    node.fx = 0;
    node.fy = 0;
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
  source,
}: {
  simulation: Simulation<GraphNodeDatum, GraphLinkDatum>;
  source?: GraphNodeDatum;
}) => {
  simulation.force(
    "actorX",
    forceX<GraphNodeDatum>((source?.x ?? 0) - graphConfig.nodeDimensions.width).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Actor) ? 1 : 0
    )
  );
  simulation.force(
    "actorY",
    forceY<GraphNodeDatum>((source?.y ?? 0) - graphConfig.nodeDimensions.height).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Actor) ? 1 : 0
    )
  );
  simulation.force(
    "investorX",
    forceX<GraphNodeDatum>((source?.x ?? 0) + graphConfig.nodeDimensions.width).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Investor) ? 1 : 0
    )
  );
  simulation.force(
    "investorY",
    forceY<GraphNodeDatum>((source?.y ?? 0) - graphConfig.nodeDimensions.height).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Investor) ? 1 : 0
    )
  );
  simulation.force(
    "investmentX",
    forceX<GraphNodeDatum>((source?.x ?? 0) + graphConfig.nodeDimensions.width).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Investment) ? 1 : 0
    )
  );
  simulation.force(
    "investmentY",
    forceY<GraphNodeDatum>((source?.y ?? 0) + graphConfig.nodeDimensions.height).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Investment) ? 1 : 0
    )
  );
  simulation.force(
    "unitX",
    forceX<GraphNodeDatum>((source?.x ?? 0) - graphConfig.nodeDimensions.width).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Unit) ? 1 : 0
    )
  );
  simulation.force(
    "unitY",
    forceY<GraphNodeDatum>((source?.y ?? 0) + graphConfig.nodeDimensions.height).strength((d) =>
      d.currentRoles?.includes(CurrentRole.Unit) ? 1 : 0
    )
  );
};

const handleDrag = (simulation: Simulation<GraphNodeDatum, GraphLinkDatum>) => {
  function dragstarted(event: D3DragEvent<HTMLElement, any, any>) {
    if (!event.active) simulation.alphaTarget(0.1).restart();
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
