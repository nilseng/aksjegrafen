import { useRef } from "react";
import { useForceSimulation } from "../../hooks/useForceSimulation";
import { useZoom } from "../../hooks/useSvgZoom2";
import { GraphType, GraphLink as IGraphLink, GraphNode as IGraphNode } from "../../models/models";
import { graphConfig } from "./GraphConfig";
import { GraphLink } from "./GraphLink";
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
  links: IGraphLink[];
}) => {
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
          {links?.length && links.map((link) => <GraphLink link={link} />)}
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
