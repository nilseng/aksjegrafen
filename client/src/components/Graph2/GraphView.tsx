import { useRef } from "react";
import { useSelector } from "react-redux";
import { useForceSimulation } from "../../hooks/useForceSimulation";
import { useZoom } from "../../hooks/useSvgZoom2";
import { GraphState, closeMenu } from "../../slices/graphSlice";
import { RootState, useAppDispatch } from "../../store";
import { graphConfig } from "./GraphConfig";
import { GraphLink } from "./GraphLink";
import { GraphMenu } from "./GraphMenu/GraphMenu";
import { GraphNode } from "./GraphNode";

export const GraphView = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const transform = useZoom(svgRef);

  const dispatch = useAppDispatch();

  const {
    data: { nodes, links, sourceUuid, targetUuid, graphType, menu },
  } = useSelector<RootState, GraphState>((state) => state.graph);

  useForceSimulation({ nodes, links, sourceUuid, targetUuid, graphType, svgRef });

  if (!nodes || nodes.length === 0) return <p>Ingen relasjoner funnet 🔎</p>;

  return (
    <>
      <GraphMenu open={menu.isOpen} node={menu.node} x={menu.position.x} y={menu.position.y} />
      <svg
        ref={svgRef}
        height="100%"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`${-graphConfig.width / 2} ${-graphConfig.height / 2} ${graphConfig.width} ${graphConfig.height}`}
      >
        <rect
          x={-graphConfig.width}
          y={-graphConfig.height}
          height={graphConfig.height * 2}
          width={graphConfig.width * 2}
          fill="transparent"
          onClick={() => {
            if (menu.isOpen) dispatch(closeMenu());
          }}
        />
        <g transform={transform}>
          <>
            {links?.length &&
              links.map((link) => (
                <GraphLink
                  key={`${link.source.properties.uuid}-${link.target.properties.uuid}-${link.type}`}
                  link={link}
                />
              ))}
            {nodes?.length &&
              nodes.map((node) => (
                <foreignObject
                  className="graph-node"
                  key={node.properties.uuid}
                  width={graphConfig.nodeDimensions.width}
                  height={graphConfig.nodeDimensions.height}
                >
                  <GraphNode node={node} />
                </foreignObject>
              ))}
          </>
        </g>
      </svg>
    </>
  );
};
