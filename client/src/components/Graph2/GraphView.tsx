import { useRef } from "react";
import { useSelector } from "react-redux";
import { useForceSimulation } from "../../hooks/useForceSimulation";
import { useZoom } from "../../hooks/useSvgZoom2";
import { GraphNodeDatum, GraphState } from "../../slices/graphSlice";
import { RootState } from "../../store";
import { graphConfig } from "./GraphConfig";
import { GraphLink } from "./GraphLink";
import { GraphNode } from "./GraphNode";

export const GraphView = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const transform = useZoom(svgRef);

  const {
    data: { nodes, links, sourceUuid, targetUuid, graphType },
  } = useSelector<RootState, GraphState>((state) => state.graph);

  useForceSimulation({ nodes, links, sourceUuid, targetUuid, graphType, svgRef });

  if (!nodes || nodes.length === 0) return <p>Ingen relasjoner funnet 🔎</p>;

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
              <GraphLink
                key={`${(link.source as GraphNodeDatum).properties.uuid}-${
                  (link.target as GraphNodeDatum).properties.uuid
                }-${link.type}`}
                link={link}
              />
            ))}
          {nodes?.length &&
            nodes.map((node) => (
              <foreignObject
                className="graph-node"
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
