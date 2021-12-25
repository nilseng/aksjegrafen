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
      <foreignObject x={node.x} y={node.y} width={node.width} height={node.height}>
        <div data-xmlns="http://www.w3.org/1999/xhtml" className="w-100 h-100 p-4">
          <div
            className="h-100 w-100 d-flex flex-column align-items-middle justify-content-between p-2"
            style={{
              ...theme.elevation,
              backgroundColor: theme.background,
              cursor: "pointer",
            }}
          >
            <div className="font-weight-bold" style={{ color: theme.text }}>
              {node.entity?.name}
            </div>
            <div>
              {node.entity.investorCount && node.entity.investorCount[year] && (
                <p className="small m-0" style={{ color: theme.text }}>
                  {node.loadedInvestors ?? 0} av {node.entity.investorCount[year]} investorer
                </p>
              )}
              {node.entity.investmentCount && node.entity.investmentCount[year] && (
                <p className="small m-0" style={{ color: theme.text }}>
                  {node.loadedInvestments ?? 0} av {node.entity.investmentCount[year]} investeringer
                </p>
              )}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
