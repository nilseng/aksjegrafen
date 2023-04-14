import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { ICompany, Year } from "../../models/models";
import { GraphContext } from "./GraphContainer";
import { GraphLinkArrow } from "./GraphLinkArrow";
import { IGraphLink, IGraphNode } from "./GraphUtils";

interface IProps {
  link: IGraphLink;
  offset: {
    x: number;
    y: number;
  };
}

const isLinkHighlighted = (link: IGraphLink, node?: IGraphNode) => {
  return node?.id === link.source.id || node?.id === link.target.id;
};

const getOwnershipPercentage = (link: IGraphLink, year: Year) => {
  const companyStocks = (link.target.entity as ICompany).shares?.[year]?.total;
  if (!companyStocks) return;
  return (
    link.ownerships.reduce((ownershipPercentage: number, o) => {
      return (
        ownershipPercentage +
        Object.values(o.holdings[year] ?? {}).reduce((sum, stocks) => sum + stocks, 0) / companyStocks
      );
    }, 0) * 100
  );
};

export const GraphLink = ({ link, offset }: IProps) => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const [rotation, setRotation] = useState<number>();
  const [arrowPos, setArrowPos] = useState<{ x: number; y: number }>({
    x: (link.source.x + 2 * link.target.x) / 3 + offset.x,
    y: (link.source.y + 2 * link.target.y) / 3 + offset.y,
  });
  const [arrowPos2, setArrowPos2] = useState<{ x: number; y: number }>({
    x: (2 * link.source.x + link.target.x) / 3 + offset.x,
    y: (2 * link.source.y + link.target.y) / 3 + offset.y,
  });
  const [countPos, setCountPos] = useState<{ x: number; y: number }>({
    x: (2 * link.source.x + 3 * link.target.x) / 5 + offset.x + 5,
    y: (2 * link.source.y + 3 * link.target.y) / 5 + offset.y,
  });
  const [percentagePos, setPercentagePos] = useState<{ x: number; y: number }>({
    x: (link.source.x + link.target.x) / 2 + offset.x,
    y: (link.source.y + link.target.y) / 2 + offset.y,
  });

  useEffect(() => {
    const cos_theta =
      (link.target.y - link.source.y) /
      Math.sqrt(Math.pow(link.target.x - link.source.x, 2) + Math.pow(link.target.y - link.source.y, 2));
    setRotation(
      link.target.x > link.source.x
        ? -(Math.acos(cos_theta) / (2 * Math.PI)) * 360
        : (Math.acos(cos_theta) / (2 * Math.PI)) * 360
    );
    setArrowPos({
      x: (link.source.x + 2 * link.target.x) / 3 + offset.x,
      y: (link.source.y + 2 * link.target.y) / 3 + offset.y,
    });
    setArrowPos2({
      x: (2 * link.source.x + link.target.x) / 3 + offset.x,
      y: (2 * link.source.y + link.target.y) / 3 + offset.y,
    });
    setCountPos({
      x: (2 * link.source.x + 3 * link.target.x) / 5 + offset.x + 5,
      y: (2 * link.source.y + 3 * link.target.y) / 5 + offset.y,
    });
    setPercentagePos({
      x: (link.source.x + link.target.x) / 2 + offset.x,
      y: (link.source.y + link.target.y) / 2 + offset.y,
    });
  }, [link, offset]);

  if (!link) return null;

  if (link.source === link.target)
    return (
      <g>
        <circle
          fill="transparent"
          stroke={theme.muted}
          strokeWidth="1"
          cx={link.source.x + 2 * offset.x}
          cy={link.source.y + offset.y}
          r="40"
        />
        <GraphLinkArrow
          center={{
            x: link.source.x + 2 * offset.x + 40,
            y: link.source.y + offset.y,
          }}
          rotation={0}
        />
        <foreignObject x={link.source.x + 2 * offset.x + 40} y={link.source.y + offset.y} width={100} height={20}>
          <div data-xmlns="http://www.w3.org/1999/xhtml">
            <div className="font-weight-bold" style={{ color: theme.primary }}>
              {getOwnershipPercentage(link, graphContext?.year as Year)?.toFixed(2) + "%"}
            </div>
          </div>
        </foreignObject>
      </g>
    );

  return (
    <g>
      <line
        x1={link.source.x + offset.x}
        y1={link.source.y + offset.y}
        x2={link.target.x + offset.x}
        y2={link.target.y + offset.y}
        stroke={isLinkHighlighted(link, graphContext?.hoveredNode) ? theme.primary : theme.muted}
        strokeWidth={isLinkHighlighted(link, graphContext?.hoveredNode) ? 2 : 1}
      />
      {(rotation || rotation === 0) && (
        <>
          <GraphLinkArrow rotation={rotation} center={arrowPos} stroke={theme.secondary} />
          <GraphLinkArrow rotation={rotation} center={arrowPos2} stroke={theme.primary} />
        </>
      )}
      {link.ownerships.length > 1 && (
        <foreignObject x={countPos.x} y={countPos.y} width={50} height={50}>
          <div data-xmlns="http://www.w3.org/1999/xhtml">
            <div className="font-weight-bold" style={{ color: theme.primary }}>
              {link.ownerships.length}
            </div>
          </div>
        </foreignObject>
      )}
      <foreignObject x={percentagePos.x} y={percentagePos.y} width={100} height={20}>
        <div data-xmlns="http://www.w3.org/1999/xhtml">
          <div className="font-weight-bold" style={{ color: theme.primary }}>
            {getOwnershipPercentage(link, graphContext?.year as Year)?.toFixed(2) + "%"}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
