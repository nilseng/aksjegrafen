import { D3DragEvent, drag, select } from "d3";
import { Dispatch, SetStateAction, useContext, useEffect, useRef } from "react";
import { AppContext } from "../../AppContext";
import { GraphContext, Year } from "./GraphContainer";
import { IMenu } from "./GraphMenu/GraphMenu";
import { IGraphLink, IGraphNode } from "./GraphUtils";

interface IProps {
  node: IGraphNode;
  year: Year;
  setMenu: Dispatch<SetStateAction<IMenu>>;
}

const replaceNode = (newNode: IGraphNode, nodes: IGraphNode[]): IGraphNode[] => {
  const newNodes = nodes?.filter((node) => node.id !== newNode.id);
  newNodes?.push(newNode);
  return newNodes;
};

const updateLinks = (newNode: IGraphNode, links: IGraphLink[]): IGraphLink[] => {
  const newLinks = [...links];
  for (const link of newLinks) {
    if (link.source.id === newNode.id) link.source = newNode;
    if (link.target.id === newNode.id) link.target = newNode;
  }
  return newLinks;
};

const dragged = (
  e: D3DragEvent<HTMLElement, any, any>,
  node: IGraphNode,
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>,
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>
) => {
  const pos = {
    x: e.x,
    y: e.y,
    fx: e.x,
    fy: e.y,
  };
  setNodes((nodes) => {
    /* Note: The dragged node's properties, like investor count, may have been updated elsewhere and the dragged node
    must be found from the nodes state to avoid race conditions. */
    const draggedNode = nodes?.find((n) => n.id === node.id);
    if (!draggedNode) return nodes;
    setLinks((links) => updateLinks(draggedNode, links ?? []));
    return replaceNode({ ...draggedNode, ...pos }, nodes ?? []);
  });
};

const addDraggableBehaviour = (
  node: IGraphNode,
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>,
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>
) => {
  return drag<SVGGElement, IGraphNode>().on("drag", (e) => dragged(e, node, setNodes, setLinks));
};

const hasUnloadedInvestors = (node: IGraphNode, year: Year): boolean => {
  const investorCount = node.entity.investorCount ? node.entity.investorCount[year] : 0;
  if (!investorCount) return false;
  if ((node.loadedInvestors ?? 0) >= investorCount) return false;
  else return true;
};

const hasUnloadedInvestments = (node: IGraphNode, year: Year): boolean => {
  const investmentCount = node.entity.investmentCount ? node.entity.investmentCount[year] : 0;
  if (!investmentCount) return false;
  if ((node.loadedInvestments ?? 0) >= investmentCount) return false;
  else return true;
};

export const GraphNode = ({ node, year, setMenu }: IProps) => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const nodeRef = useRef<SVGGElement>(null);
  const hasDrag = useRef<boolean>(false);

  useEffect(() => {
    if (graphContext?.setNodes && graphContext.setLinks && nodeRef.current) {
      const nodeEl = select<SVGGElement, IGraphNode>(nodeRef.current).datum<IGraphNode>(node);
      if (!hasDrag.current) {
        addDraggableBehaviour(node, graphContext?.setNodes, graphContext.setLinks)(nodeEl);
        hasDrag.current = true;
      }
    }
  }, [node, graphContext?.setNodes, graphContext?.setLinks]);

  const handleFocused = () => {
    graphContext?.setHoveredNode(node);
  };

  const handleFocusEnd = () => {
    graphContext?.setHoveredNode(undefined);
  };

  return (
    <g ref={nodeRef}>
      {hasUnloadedInvestors(node, year) && (
        <>
          <line
            x1={node.x + node.width / 2}
            y1={node.y + node.height / 2}
            x2={node.x + node.width / 2}
            y2={node.y - 16}
            stroke={theme.secondary}
          />
          <circle
            style={{ cursor: "pointer" }}
            cx={node.x + node.width / 2}
            cy={node.y - 16}
            r={15}
            fill={theme.backgroundSecondary}
            stroke={theme.secondary}
            onClick={() => graphContext?.nodeActions.loadInvestors(node)}
          />
        </>
      )}
      {hasUnloadedInvestments(node, year) && (
        <>
          <line
            x1={node.x + node.width / 2}
            y1={node.y + node.height / 2}
            x2={node.x + node.width / 2}
            y2={node.y + node.height + 16}
            stroke={theme.primary}
          />
          <circle
            style={{ cursor: "pointer" }}
            cx={node.x + node.width / 2}
            cy={node.y + node.height + 16}
            r={15}
            fill={theme.backgroundSecondary}
            stroke={theme.primary}
            onClick={() => graphContext?.nodeActions.loadInvestments(node)}
          />
        </>
      )}
      <foreignObject x={node.x} y={node.y} width={node.width} height={node.height}>
        <div data-xmlns="http://www.w3.org/1999/xhtml" className="w-100 h-100 p-4" style={{ userSelect: "none" }}>
          <div
            className="h-100 w-100 p-1"
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
            onMouseOver={handleFocused}
            onMouseLeave={handleFocusEnd}
            onTouchStartCapture={handleFocused}
            onTouchEndCapture={handleFocusEnd}
            onTouchCancelCapture={handleFocusEnd}
            style={{
              ...theme.elevation,
              backgroundColor: theme.backgroundSecondary,
              cursor: "pointer",
            }}
          >
            <div
              className="w-100 h-100 d-flex flex-column align-items-middle justify-content-between p-1"
              style={{ border: `${theme.primary} solid 1px`, borderRadius: "0.5rem" }}
            >
              {node.entity.investorCount && node.entity.investorCount[year] && (
                <p className="text-center small m-0" style={{ color: theme.text }}>
                  <strong style={{ color: theme.secondary }}>{node.loadedInvestors ?? 0}</strong> av{" "}
                  <strong style={{ color: theme.secondary }}>{node.entity.investorCount[year]}</strong> investorer
                </p>
              )}
              <div className="text-center font-weight-bold" style={{ color: theme.text }}>
                {node.entity?.name}
              </div>
              {node.entity.investmentCount && node.entity.investmentCount[year] && (
                <p className="text-center small m-0" style={{ color: theme.text }}>
                  <strong style={{ color: theme.primary }}>{node.loadedInvestments ?? 0}</strong> av{" "}
                  <strong style={{ color: theme.primary }}>{node.entity.investmentCount[year]}</strong> investeringer
                </p>
              )}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
