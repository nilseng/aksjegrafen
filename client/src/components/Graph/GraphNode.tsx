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

export const GraphNode = ({ node, year }: IProps) => {
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
