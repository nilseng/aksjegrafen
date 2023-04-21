import { useContext, useRef, useState } from "react";
import { AppContext } from "../../AppContext";
import { useZoom } from "../../hooks/useSvgZoom";
import { GraphContext, Year } from "./GraphContainer";
import { GraphLink } from "./GraphLink";
import { GraphMenu, IMenu } from "./GraphMenu/GraphMenu";
import { GraphNode } from "./GraphNode";
import { IGraphLink, IGraphNode, INodeDimensions } from "./GraphUtils";
import { HowToModal } from "./HowToModal";
import { YearSelector } from "./YearSelector";

interface IProps {
  year: Year;
  nodeDimensions: INodeDimensions;
  nodes: IGraphNode[];
  links: IGraphLink[];
}

export const GraphView = ({ year, nodeDimensions, nodes, links }: IProps) => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const [menu, setMenu] = useState<IMenu>({ open: false });

  const svgRef = useRef<SVGSVGElement>(null);
  useZoom(svgRef);
  return (
    <div className="d-flex w-100 h-100 px-2 px-sm-4 pb-2 pb-sm-4 pt-0">
      <YearSelector />
      <HowToModal />
      <div className="d-flex w-100 h-100" style={{ ...theme.lowering }}>
        <GraphMenu {...menu} setMenu={setMenu} />
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
          <g transform={graphContext?.svgTransform}>
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
              <g key={node.id}>
                <GraphNode node={{ ...node, ...nodeDimensions }} year={year} setMenu={setMenu} />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
