import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { IGraphLink } from "./GraphUtils";

interface IProps {
  link: IGraphLink;
  offset: {
    x: number;
    y: number;
  };
}

export const GraphLink = ({ link, offset }: IProps) => {
  const { theme } = useContext(AppContext);

  const [rotation, setRotation] = useState<number>();
  const [center] = useState<{ x: number; y: number }>({
    x: (link.source.x + 2 * link.target.x) / 3 + offset.x,
    y: (link.source.y + 2 * link.target.y) / 3 + offset.y,
  });

  useEffect(() => {
    const cos_theta =
      (link.target.y - link.source.y) /
      Math.sqrt(
        Math.pow(link.target.x - link.source.x, 2) +
          Math.pow(link.target.y - link.source.y, 2)
      );
    setRotation(
      link.target.x > link.source.x
        ? -(Math.acos(cos_theta) / (2 * Math.PI)) * 360
        : (Math.acos(cos_theta) / (2 * Math.PI)) * 360
    );
  }, [link]);

  if (!link) return null;

  return (
    <g>
      <line
        x1={link.source.x + offset.x}
        y1={link.source.y + offset.y}
        x2={link.target.x + offset.x}
        y2={link.target.y + offset.y}
        stroke={theme.muted}
      />
      {(rotation || rotation === 0) && (
        <g transform={`rotate(${rotation} ${center.x} ${center.y})`}>
          <line
            x1={center.x - 10}
            y1={center.y - 10}
            x2={center.x}
            y2={center.y}
            stroke={theme.muted}
            strokeWidth="4"
          />
          <line
            x1={center.x}
            y1={center.y}
            x2={center.x + 10}
            y2={center.y - 10}
            stroke={theme.muted}
            strokeWidth="4"
          />
        </g>
      )}
      {link.ownerships.length > 1 && (
        <foreignObject x={center.x + 10} y={center.y} width={50} height={50}>
          <div data-xmlns="http://www.w3.org/1999/xhtml">
            <div className="font-weight-bold" style={{ color: theme.primary }}>
              {link.ownerships.length}
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};
