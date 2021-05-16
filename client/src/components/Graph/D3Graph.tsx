import React from "react";
import {
  forceSimulation,
  forceLink,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from "d3-force";

export const D3Graph = () => {
  const nodes: SimulationNodeDatum[] = [{ index: 1 }, { index: 2 }];
  const links: SimulationLinkDatum<SimulationNodeDatum>[] = [
    { source: nodes[0], target: nodes[1] },
  ];

  const graph = forceSimulation(nodes);

  console.log(graph.nodes());
  console.log(links);

  return (
    <>
      <div className="rotatedRectBackground" />
      <p>d3 graph to come</p>
    </>
  );
};
