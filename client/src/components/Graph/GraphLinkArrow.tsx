import { useContext } from "react";
import { AppContext } from "../../App";

interface IProps {
  center: {
    x: number;
    y: number;
  };
  rotation: number;
}

export const GraphLinkArrow = ({ rotation, center }: IProps) => {
  const { theme } = useContext(AppContext);

  return (
    <g transform={`rotate(${rotation} ${center.x} ${center.y})`}>
      <line
        x1={center.x - 5}
        y1={center.y - 5}
        x2={center.x}
        y2={center.y}
        stroke={theme.muted}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1={center.x}
        y1={center.y}
        x2={center.x + 5}
        y2={center.y - 5}
        stroke={theme.muted}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
};
