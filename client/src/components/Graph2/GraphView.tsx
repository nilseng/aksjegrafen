import { useContext, useRef } from "react";
import { AppContext } from "../../AppContext";
import { useForceSimulation } from "../../hooks/useForceSimulation";
import { useZoom } from "../../hooks/useSvgZoom2";
import { GraphLink, GraphType, GraphNode as IGraphNode } from "../../models/models";
import { GraphNodeDatum } from "../../slices/graphSlice";
import { graphConfig } from "./GraphConfig";
import { GraphNode } from "./GraphNode";

export const GraphView = ({
  graphType,
  source,
  target,
  nodes,
  links,
}: {
  graphType: GraphType;
  source?: IGraphNode;
  target?: IGraphNode;
  nodes: IGraphNode[];
  links: GraphLink[];
}) => {
  const { theme } = useContext(AppContext);

  const svgRef = useRef<SVGSVGElement>(null);

  const transform = useZoom(svgRef);

  useForceSimulation({ nodes, links, source, target, graphType, svgRef });

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
