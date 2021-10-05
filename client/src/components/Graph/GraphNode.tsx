import { useContext } from "react";
import { AppContext } from "../../App";
import { GraphNodeEntity } from "../../models/models";

interface IProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  data: {
    entity: GraphNodeEntity;
    investmentCount?: number;
    ownerCount?: number;
  };
  isVisible?: boolean;
}

export const GraphNode = ({
  x,
  y,
  width,
  height,
  data,
  isVisible = true,
}: IProps) => {
  const { theme } = useContext(AppContext);

  return (
    <g>
      <foreignObject x={x} y={y} width={width} height={height} className="p-5">
        <div
          data-xmlns="http://www.w3.org/1999/xhtml"
          className="p-2 w-100 h-100"
          style={theme.elevation}
        >
          {data.ownerCount && (
            <p className="small m-0" style={{ color: theme.muted }}>
              {data.ownerCount} eier{data.ownerCount > 1 && "e"}
            </p>
          )}
          <p className="font-weight-bold" style={{ color: theme.primary }}>
            {data.entity.company?.name ?? data.entity.shareholder?.name}
          </p>
        </div>
      </foreignObject>
    </g>
  );
};
