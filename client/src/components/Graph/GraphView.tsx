import { useContext, useRef, useState } from "react";
import { AppContext } from "../../App";
import { GraphLink } from "./GraphLink";
import { GraphMenu, IMenu } from "./GraphMenu";
import { GraphNode } from "./GraphNode";
import { IGraphLink, IGraphNode, INodeDimensions, useZoom } from "./GraphUtils";

interface IProps {
  nodeDimensions: INodeDimensions;
  nodes: IGraphNode[];
  links: IGraphLink[];
}

export const GraphView = ({ nodeDimensions, nodes, links }: IProps) => {
  const { theme } = useContext(AppContext);

  const [menu, setMenu] = useState<IMenu>({ open: false });

  const svgRef = useRef<SVGSVGElement>(null);
  const svgTranslate = useZoom(svgRef);
  return (
    <div className="d-flex w-100 h-100 p-4">
      <div className="d-flex w-100 h-100" style={{ ...theme.lowering }}>
        <GraphMenu {...menu} setMenu={setMenu} />
        <svg
          ref={svgRef}
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={"0 0 1000 1000"}
        >
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
            {/* TODO: Detect duplicate nodes instead of using the i here. */}
            {nodes.map((node, i) => {
              return (
                <g
                  key={node.entity._id + i}
                  onClick={(e) => {
                    setMenu({
                      open: true,
                      entity: node.entity,
                      x: e.pageX,
                      y: e.pageY,
                    });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMenu({
                      open: true,
                      entity: node.entity,
                      x: e.pageX,
                      y: e.pageY,
                    });
                  }}
                >
                  <GraphNode {...node} {...nodeDimensions} />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
