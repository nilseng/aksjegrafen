import { useContext } from "react";
import { AppContext } from "../../App";
import { IGraphNode } from "./GraphUtils";

interface IProps {
  node: IGraphNode;
  year: 2020 | 2019;
}

export const GraphNode = ({ node, year }: IProps) => {
  const { theme } = useContext(AppContext);

  return (
    <g>
      <foreignObject
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        style={{
          ...theme.elevation,
          backgroundColor: theme.background,
          cursor: "pointer",
        }}
      >
        <div
          data-xmlns="http://www.w3.org/1999/xhtml"
          className="p-2 w-100 h-100 d-flex flex-column align-items-middle justify-content-between"
        >
          <div className="font-weight-bold" style={{ color: theme.text }}>
            {node.entity?.name}
          </div>
          <div>
            {(node.loadedInvestors || node.loadedInvestors === 0) &&
              node.entity.investorCount && (
                <p className="small m-0" style={{ color: theme.text }}>
                  {node.loadedInvestors} av {node.entity.investorCount[year]}{" "}
                  investorer
                </p>
              )}
            {(node.loadedInvestments || node.loadedInvestments === 0) &&
              node.entity.investmentCount && (
                <p className="small m-0" style={{ color: theme.text }}>
                  {node.loadedInvestments} av{" "}
                  {node.entity.investmentCount[year]} investeringer
                </p>
              )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
