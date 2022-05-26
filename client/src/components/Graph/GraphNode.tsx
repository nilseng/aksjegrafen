import { D3DragEvent, drag, select } from "d3";
import { Dispatch, SetStateAction, useContext, useEffect, useRef } from "react";
import { AppContext } from "../../App";
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
  e: D3DragEvent<any, any, any>,
  dragOffset: { x: number; y: number },
  nodeId: string,
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>,
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>
) => {
  const pos = {
    x: e.x - dragOffset.x,
    y: e.y - dragOffset.y,
    fx: e.x - dragOffset.x,
    fy: e.y - dragOffset.y,
  };
  setNodes((nodes) => {
    const draggedNode = nodes?.find((node) => node.id === nodeId);
    if (!draggedNode) return nodes;
    setLinks((links) => updateLinks(draggedNode, links ?? []));
    return replaceNode({ ...draggedNode, ...pos }, nodes ?? []);
  });
};

const addDraggableBehaviour = (
  nodeId: string,
  nodeWidth: number,
  nodeHeight: number,
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>,
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>
) => {
  const dragOffset = { x: nodeWidth / 2, y: nodeHeight / 2 };
  return drag().on("drag", (e) => dragged(e, dragOffset, nodeId, setNodes, setLinks));
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

  const nodeRef: any = useRef<SVGGElement>(null);

  useEffect(() => {
    if (graphContext?.setNodes && graphContext.setLinks) {
      const nodeEl = select(nodeRef.current);
      nodeEl.call(
        addDraggableBehaviour(node.id, node.width, node.height, graphContext?.setNodes, graphContext.setLinks)
      );
    }
  }, [node.id, node.width, node.height, graphContext?.setNodes, graphContext?.setLinks]);

  const handleFocused = () => {
    graphContext?.setHoveredNode(node);
  };

  const handleFocusEnd = () => {
    graphContext?.setHoveredNode(undefined);
  };

  return (
    <g ref={nodeRef}>
      <foreignObject x={node.x} y={node.y} width={node.width} height={node.height}>
        <div data-xmlns="http://www.w3.org/1999/xhtml" className="w-100 h-100 p-4">
          <div
            className="h-100 w-100 d-flex flex-column align-items-middle justify-content-between p-2"
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
              backgroundColor: theme.background,
              cursor: "pointer",
            }}
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
      </foreignObject>
      {hasUnloadedInvestors(node, year) && (
        <path
          style={{ cursor: "pointer" }}
          d={`M${node.x + node.width / 2 - 10},${node.y + 24} a10,10 0 0,1 20,0`}
          fill={theme.secondary}
          onClick={() => graphContext?.nodeActions.loadInvestors(node)}
        />
      )}
      {hasUnloadedInvestments(node, year) && (
        <path
          style={{ cursor: "pointer" }}
          d={`M${node.x + node.width / 2 - 10},${node.y + node.height - 24} a10,10 0 0,0 20,0`}
          fill={theme.primary}
          onClick={() => graphContext?.nodeActions.loadInvestments(node)}
        />
      )}
    </g>
  );
};
