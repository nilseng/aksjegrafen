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
        style={{ ...theme.elevation, backgroundColor: theme.background }}
      >
        <div
          data-xmlns="http://www.w3.org/1999/xhtml"
          className="p-2 w-100 h-100 d-flex flex-column align-items-middle justify-content-between"
        >
          <div className="font-weight-bold" style={{ color: theme.text }}>
            {node.entity?.name}
          </div>
          <div>
            {node.loadedInvestors && (
              <p className="small m-0" style={{ color: theme.text }}>
                {node.loadedInvestors} av x investorer
              </p>
            )}
            {node.loadedInvestments && (
              <p className="small m-0" style={{ color: theme.text }}>
                {node.loadedInvestments} av y investeringer
              </p>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
