import { useContext } from "react";
import { AppContext } from "../../AppContext";

interface IProps {
  center: {
    x: number;
    y: number;
  };
  rotation: number;
  stroke?: string;
}

export const GraphLinkArrow = ({ rotation, center, stroke }: IProps) => {
  const { theme } = useContext(AppContext);

  return (
    <g transform={`translate(${center.x}, ${center.y}) rotate(${rotation})`}>
      <line x1={-5} y1={-5} x2={0} y2={0} stroke={stroke ?? theme.muted} strokeWidth="2" strokeLinecap="round" />
      <line x1={0} y1={0} x2={5} y2={-5} stroke={stroke ?? theme.muted} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
};
