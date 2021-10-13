import { useContext } from "react";
import { AppContext } from "../../App";
import { IGraphNode } from "./GraphUtils";

export const GraphNode = (node: IGraphNode) => {
  const { theme } = useContext(AppContext);
  return (
    <g>
      <foreignObject
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        className="p-5"
      >
        <div
          data-xmlns="http://www.w3.org/1999/xhtml"
          className="p-2 w-100 h-100 d-flex flex-column align-items-middle justify-content-center"
          style={theme.elevation}
        >
          <div className="font-weight-bold" style={{ color: theme.primary }}>
            {node.entity?.name}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
