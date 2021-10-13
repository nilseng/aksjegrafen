import { useContext, useRef } from "react";
import { AppContext } from "../../App";
import { GraphLink } from "./GraphLink";
import { GraphNode } from "./GraphNode";
import { IGraphLink, IGraphNode, INodeDimensions, useZoom } from "./GraphUtils";

interface IProps {
  nodeDimensions: INodeDimensions;
  nodes: IGraphNode[];
  links: IGraphLink[];
}

export const GraphView = ({ nodeDimensions, nodes, links }: IProps) => {
  const { theme } = useContext(AppContext);

  const svgRef = useRef<SVGSVGElement>(null);
  const svgTranslate = useZoom(svgRef);
  return (
    <div className="d-flex w-100 h-100 p-4">
      <div className="d-flex w-100 h-100" style={{ ...theme.lowering }}>
        <svg
          ref={svgRef}
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={"0 0 1000 1000"}
        >
          <g transform={svgTranslate}>
            {links.map((link) => (
              <GraphLink
                key={`${link.source.id}-${link.target.id}`}
                link={link}
                offset={{
                  x: nodeDimensions.width / 2,
                  y: nodeDimensions.height / 2,
                }}
              />
            ))}
            {/* TODO: Detect duplicate nodes instead of using the i here. */}
            {nodes.map((node, i) => {
              return (
                <GraphNode
                  key={node.entity._id + i}
                  {...node}
                  {...nodeDimensions}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
