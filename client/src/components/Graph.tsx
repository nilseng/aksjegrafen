import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { useContext } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { AppContext } from "../App";
import { useCompanyGraph } from "../services/apiService";

cytoscape.use(fcose);

export const Graph = () => {
  const { theme } = useContext(AppContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core>();

  const { ownerships, nodes } = useCompanyGraph(2020, 10000);

  useEffect(() => {
    if (containerRef.current && nodes && ownerships) {
      cyRef.current = cytoscape({
        container: containerRef.current, // container to render in
        elements: {
          nodes: Object.keys(nodes).map((key) => ({
            data: { id: nodes[key].orgnr, name: nodes[key].name },
          })),
          edges: ownerships.map((o) => ({
            data: {
              id: o._id,
              source: o.shareholderOrgnr as string,
              target: o.orgnr,
            },
          })),
        },
        style: [
          {
            selector: "node",
            style: {
              "background-color": (node: cytoscape.NodeSingular) =>
                `rgb(${Math.max(255 - node.degree(true), 0)},255,255)`,
              opacity: (node: cytoscape.NodeSingular) =>
                node.degree(false) > 1 ? 1 : 0.2,
              color: theme.primary,
              "font-weight": "bold",
              "z-index": (node: cytoscape.NodeSingular) =>
                node.data("name") ? 1 : 0,
              height: (node) =>
                node.data("type") === "company"
                  ? Math.pow(node.degree(true), 0.8)
                  : Math.pow(node.degree(true), 0.8),
              width: (node: cytoscape.NodeSingular) =>
                node.data("type") === "company"
                  ? Math.pow(node.degree(true), 0.8)
                  : Math.pow(node.degree(true), 0.8),
            },
          },
          {
            selector: "edge",
            style: {
              width: 1,
              "line-color": "#f8f9fa",
              opacity: 0.2,
              "target-arrow-color": "#ccc",
              "target-arrow-shape": "none",
              "curve-style": "bezier",
            },
          },
        ],
        zoomingEnabled: true,
        userZoomingEnabled: true,
        panningEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true,
        layout: {
          name: "fcose",
        },
      });
    }
  }, [containerRef, nodes, ownerships, theme]);

  return (
    <div
      ref={containerRef}
      style={{ minHeight: "calc(100vh - 58.78px)" }}
    ></div>
  );
};
