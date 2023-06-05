import {
  D3DragEvent,
  Simulation,
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
} from "d3";
import { cloneDeep } from "lodash";
import { useContext, useEffect, useRef } from "react";
import { AppContext } from "../../AppContext";
import { useZoom } from "../../hooks/useSvgZoom2";
import { GraphLinkDatum, GraphNodeDatum } from "../../slices/graphSlice";
import { IGraphDimensions, graphConfig } from "./GraphConfig";
import { GraphNode } from "./GraphNode";

const nodeOffset = {
  x: graphConfig.nodeDimensions.width / 2,
  y: graphConfig.nodeDimensions.height / 2,
};

export const getGraphCenter = (dimensions: IGraphDimensions) => {
  return {
    x: dimensions.width / 2 - dimensions.nodeDimensions.width / 2,
    y: dimensions.height / 2 - dimensions.nodeDimensions.height / 2,
  };
};

const handleDrag = (simulation: Simulation<GraphNodeDatum, GraphLinkDatum>) => {
  function dragstarted(event: D3DragEvent<HTMLElement, any, any>) {
    if (!event.active) simulation.alphaTarget(0.1).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: D3DragEvent<HTMLElement, any, any>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: D3DragEvent<HTMLElement, any, any>) {
    if (!event.active) simulation.alphaTarget(0);
  }

  return drag<SVGForeignObjectElement, GraphNodeDatum>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

export const GraphView = ({ nodes, links }: { nodes: GraphNodeDatum[]; links: GraphLinkDatum[] }) => {
  const { theme } = useContext(AppContext);

  const svgRef = useRef<SVGSVGElement>(null);

  const transform = useZoom(svgRef);

  useEffect(() => {
    if (nodes?.length > 0) {
      const svg = select(svgRef.current);

      const mutableNodes: GraphNodeDatum[] = cloneDeep(nodes).map((node, index) => ({ index, x: 0, y: 0, ...node }));
      const mutableLinks = links.map((link) => ({
        ...link,
        source: mutableNodes.find((node) => node.properties.uuid === (link.source as GraphNodeDatum).properties.uuid)!,
        target: mutableNodes.find((node) => node.properties.uuid === (link.target as GraphNodeDatum).properties.uuid)!,
      }));

      const link = svg.selectAll("line").data(mutableLinks).join("line");

      const simulation = forceSimulation<GraphNodeDatum, GraphLinkDatum>(mutableNodes)
        .alpha(0.4)
        .force(
          "link",
          forceLink(mutableLinks).id(({ index }) => mutableNodes.find((node) => node.index === index) as any)
        )
        .force("charge", forceManyBody())
        .force("center", forceCenter())
        .force(
          "collide",
          forceCollide(Math.max(graphConfig.nodeDimensions.width / 2, graphConfig.nodeDimensions.height / 2))
        );

      const node = svg
        .selectAll<SVGForeignObjectElement, GraphNodeDatum>("foreignObject")
        .data(mutableNodes)
        .join("foreignObject")
        .call(handleDrag(simulation));

      simulation.on("tick", () => {
        node.attr("x", (d) => d.x! - nodeOffset.x).attr("y", (d) => d.y! - nodeOffset.y);
        link
          .attr("x1", (d) => d.source.x!)
          .attr("y1", (d) => d.source.y!)
          .attr("x2", (d) => d.target.x!)
          .attr("y2", (d) => d.target.y!);
      });
    }
  }, [nodes, links]);

  return (
    <svg
      ref={svgRef}
      height="100%"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${-graphConfig.width / 2} ${-graphConfig.height / 2} ${graphConfig.width} ${graphConfig.height}`}
    >
      <g transform={transform}>
        <>
          {links?.length &&
            links.map((link) => (
              <line
                key={`${(link.source as GraphNodeDatum).properties.uuid}-${
                  (link.target as GraphNodeDatum).properties.uuid
                }-${link.type}`}
                stroke={theme.primary}
                strokeWidth={1}
              />
            ))}
          {nodes?.length &&
            nodes.map((node) => (
              <foreignObject
                key={node.properties.uuid}
                width={graphConfig.nodeDimensions.width}
                height={graphConfig.nodeDimensions.height}
              >
                <GraphNode node={node} />
              </foreignObject>
            ))}
        </>
      </g>
    </svg>
  );
};
