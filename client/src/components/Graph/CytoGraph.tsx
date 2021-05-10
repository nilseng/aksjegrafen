import * as React from "react";
import cytoscape from "cytoscape";

const elements = [
  {
    data: { id: "a" },
  },
  {
    data: { id: "b" },
  },
  {
    data: { id: "ab", source: "a", target: "b" },
  },
];

const Graph = () => {
  const container = React.useRef<HTMLDivElement>(null);
  const graph = React.useRef<cytoscape.Core>();

  React.useEffect(() => {
    if (graph.current) {
      graph.current.add(elements);
    }
  }, []);

  React.useEffect(() => {
    if (!container.current) {
      return;
    }
    try {
      if (!graph.current) {
        graph.current = cytoscape({
          elements,
          style: [
            {
              selector: "node",
              style: {
                "background-color": "#1c3e3f",
                label: "data(id)",
              },
            },
            {
              selector: "edge",
              style: {
                label: "data(id)",
                width: 3,
                "line-color": "#000000",
                "curve-style": "bezier",
              },
            },
          ],
          maxZoom: 1e50,
          wheelSensitivity: 0.5,
          container: container.current,
        });
      }
    } catch (error) {
      console.error(error);
    }
    return () => {
      graph.current && graph.current.destroy();
    };
  }, []);

  return (
    <div
      className="graph"
      ref={container}
      style={{ height: "100%", width: "100%", position: "absolute" }}
    />
  );
};

export default Graph;
