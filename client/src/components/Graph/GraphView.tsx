import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../../App";
import { GraphLink } from "./GraphLink";
import { GraphMenu, IMenu } from "./GraphMenu/GraphMenu";
import { GraphNode } from "./GraphNode";
import { IGraphLink, IGraphNode, INodeDimensions } from "./GraphUtils";
import { useZoom } from "../../hooks/useSvgZoom";
import { YearSelector } from "./YearSelector";
import { HowToModal } from "./GraphModal/HowToModal";

interface IProps {
  year: 2019 | 2020;
  nodeDimensions: INodeDimensions;
  nodes: IGraphNode[];
  links: IGraphLink[];
  svgTranslate: string;
  setSvgTranslate: React.Dispatch<React.SetStateAction<string>>;
  resetZoom: boolean;
  setResetZoom: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GraphView = ({
  year,
  nodeDimensions,
  nodes,
  links,
  svgTranslate,
  setSvgTranslate,
  resetZoom,
  setResetZoom,
}: IProps) => {
  const { theme } = useContext(AppContext);

  const [menu, setMenu] = useState<IMenu>({ open: false });

  const svgRef = useRef<SVGSVGElement>(null);
  useZoom(setSvgTranslate, resetZoom, setResetZoom, svgRef);
  return (
    <div className="d-flex w-100 h-100 px-4 pb-4 pt-0">
      <YearSelector />
      <div className="d-flex w-100 h-100" style={{ ...theme.lowering }}>
        <GraphMenu {...menu} setMenu={setMenu} />
        <HowToModal />
        <svg ref={svgRef} height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" viewBox={"0 0 1000 1000"}>
          <rect
            fill="transparent"
            width="3000"
            height="3000"
            x={-1000}
            y={-1000}
            onClick={(e) => {
              setMenu({ open: !menu.open, x: e.pageX, y: e.pageY });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setMenu({ open: !menu.open, x: e.pageX, y: e.pageY });
            }}
          ></rect>
          <g transform={svgTranslate}>
            {links.map((link) => (
              <GraphLink
                key={`${link.source.id}-${link.target.id}`}
                link={link}
                offset={{
                  x: nodeDimensions.width / 2,
                  y: nodeDimensions.height / 2,
                }}
              />
            ))}
            {nodes.map((node) => (
              <g
                key={node.id}
                onClick={(e) => {
                  setMenu({
                    open: true,
                    node,
                    x: e.pageX,
                    y: e.pageY,
                  });
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({
                    open: true,
                    node,
                    x: e.pageX,
                    y: e.pageY,
                  });
                }}
              >
                <GraphNode node={{ ...node, ...nodeDimensions }} year={year} />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
