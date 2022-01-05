import { D3DragEvent, drag, select } from "d3";
import { Dispatch, SetStateAction, useContext, useEffect, useRef } from "react";
import { AppContext } from "../../App";
import { GraphContext } from "./GraphContainer";
import { IGraphLink, IGraphNode } from "./GraphUtils";

interface IProps {
  node: IGraphNode;
  year: 2020 | 2019;
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

const dragStarted = (
  e: D3DragEvent<any, any, any>,
  dragOffset: { x: number; y: number },
  node: IGraphNode,
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>,
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>
) => {
  const draggedNode = {
    ...node,
    x: e.subject.x - dragOffset.x,
    y: e.subject.y - dragOffset.y,
    fx: e.subject.x - dragOffset.x,
    fy: e.subject.y - dragOffset.y,
  };
  setNodes((nodes) => replaceNode(draggedNode, nodes ?? []));
  setLinks((links) => updateLinks(draggedNode, links ?? []));
};

const dragged = (
  e: D3DragEvent<any, any, any>,
  dragOffset: { x: number; y: number },
  node: IGraphNode,
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>,
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>
) => {
  const draggedNode = {
    ...node,
    x: e.x - dragOffset.x,
    y: e.y - dragOffset.y,
    fx: e.x - dragOffset.x,
    fy: e.y - dragOffset.y,
  };
  setNodes((nodes) => replaceNode(draggedNode, nodes ?? []));
  setLinks((links) => updateLinks(draggedNode, links ?? []));
};

const addDraggableBehaviour = (
  node: IGraphNode,
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>,
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>
) => {
  const dragOffset = { x: node.width / 2, y: node.height / 2 };
  return drag()
    .on("start", (e) => dragStarted(e, dragOffset, node, setNodes, setLinks))
    .on("drag", (e) => dragged(e, dragOffset, node, setNodes, setLinks))
    .touchable(false);
};

export const GraphNode = ({ node, year }: IProps) => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const nodeRef: any = useRef<SVGGElement>(null);

  useEffect(() => {
    if (graphContext?.setNodes && graphContext.setLinks) {
      const nodeEl = select(nodeRef.current);
      nodeEl.call(addDraggableBehaviour(node, graphContext?.setNodes, graphContext.setLinks));
    }
  }, [node, graphContext?.setNodes, graphContext?.setLinks]);

  return (
    <g ref={nodeRef}>
      <foreignObject x={node.x} y={node.y} width={node.width} height={node.height}>
        <div data-xmlns="http://www.w3.org/1999/xhtml" className="w-100 h-100 p-4">
          <div
            className="h-100 w-100 d-flex flex-column align-items-middle justify-content-between p-2"
            style={{
              ...theme.elevation,
              backgroundColor: theme.background,
              cursor: "pointer",
            }}
          >
            <div className="font-weight-bold" style={{ color: theme.text }}>
              {node.entity?.name}
            </div>
            <div>
              {node.entity.investorCount && node.entity.investorCount[year] && (
                <p className="small m-0" style={{ color: theme.text }}>
                  {node.loadedInvestors ?? 0} av {node.entity.investorCount[year]} investorer
                </p>
              )}
              {node.entity.investmentCount && node.entity.investmentCount[year] && (
                <p className="small m-0" style={{ color: theme.text }}>
                  {node.loadedInvestments ?? 0} av {node.entity.investmentCount[year]} investeringer
                </p>
              )}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
