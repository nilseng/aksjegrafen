import { useEffect, useState } from "react";
import { Graph, GraphConfiguration } from "react-d3-graph";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";

// graph payload (with minimalist structure)
const data = {
  nodes: [{ id: "Harry" }, { id: "Sally" }, { id: "Alice" }],
  links: [
    { source: "Harry", target: "Sally" },
    { source: "Harry", target: "Alice" },
  ],
};

const onClickNode = function (nodeId: string) {
  window.alert(`Clicked node ${nodeId}`);
};

const onClickLink = function (source: string, target: string) {
  window.alert(`Clicked link between ${source} and ${target}`);
};

export const D3Graph = () => {
  const [graphConfig, setGraphConfig] = useState<
    GraphConfiguration<any, any>
  >();

  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (width && height) {
      setGraphConfig({
        nodeHighlightBehavior: true,
        width,
        height,
        collapsible: true,
        panAndZoom: true,
        directed: true,
        node: {
          color: "lightgreen",
          size: Math.max(width, height),
          highlightStrokeColor: "blue",
        },
        link: {
          highlightColor: "lightblue",
        },
      } as GraphConfiguration<any, any>);
    }
  }, [width, height]);

  return (
    <Graph
      id="graph-id"
      data={data}
      config={graphConfig}
      onClickNode={onClickNode}
      onClickLink={onClickLink}
    />
  );
};
