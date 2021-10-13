import { useContext, useRef } from "react";
import { AppContext } from "../../App";
import { GraphNode } from "./GraphNode";
import { IGraphNode, INodeDimensions, useZoom } from "./GraphUtils";

interface IProps {
  nodeDimensions: INodeDimensions;
  nodes: IGraphNode[];
}

export const GraphView = ({ nodeDimensions, nodes }: IProps) => {
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
