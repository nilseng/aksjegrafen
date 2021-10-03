import { useContext } from "react";
import { AppContext } from "../../App";
import { ICompany, IShareholder } from "../../models/models";

interface IProps {
  x: number;
  y: number;
  width: number;
  height: number;
  data: {
    entity: Partial<ICompany & IShareholder>;
    investmentCount?: number;
    ownerCount?: number;
  };
}

export const GraphNode = ({ x, y, width, height, data }: IProps) => {
  const { theme } = useContext(AppContext);

  return (
    <g>
      <foreignObject
        x={x}
        y={y}
        width={width}
        height={height}
        className="p-2"
        style={theme.elevation}
      >
        <div data-xmlns="http://www.w3.org/1999/xhtml">
          {data.ownerCount && (
            <p className="small m-0" style={{ color: theme.muted }}>
              {data.ownerCount} owner{data.ownerCount > 1 && "s"}
            </p>
          )}
          <p className="font-weight-bold" style={{ color: theme.primary }}>
            {data.entity.name}
          </p>
        </div>
      </foreignObject>
    </g>
  );
};
