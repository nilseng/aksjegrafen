import { useContext } from "react";
import { AppContext } from "../../App";
import { ICompany, IShareholder } from "../../models/models";
import { IForceSimulationNode } from "./GraphUtils";

export interface IGraphNode {
  x?: number;
  y?: number;
  width: number;
  height: number;
  entity: ICompany | IShareholder;
  investmentCount?: number;
  investorCount?: number;
  isVisible?: boolean;
}

export const GraphNode = (node: IGraphNode & IForceSimulationNode) => {
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
          className="p-2 w-100 h-100"
          style={theme.elevation}
        >
          {/* {investorCount && (
            <p className="small m-0" style={{ color: theme.muted }}>
              {investorCount} eier{investorCount > 1 && "e"}
            </p>
          )} */}
          <p className="font-weight-bold" style={{ color: theme.primary }}>
            {node.entity?.name}
          </p>
        </div>
      </foreignObject>
    </g>
  );
};
