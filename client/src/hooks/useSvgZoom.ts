import { select, zoom, zoomTransform, zoomIdentity } from "d3";
import { useContext, useLayoutEffect } from "react";
import { GraphContext } from "../components/Graph/GraphContainer";

export const useZoom = (svgEl?: React.RefObject<SVGSVGElement>) => {
  const graphContext = useContext(GraphContext);

  useLayoutEffect(() => {
    const zoomed = (transform: any) => {
      graphContext?.setSvgTransform(`translate(${transform.x},${transform.y}) scale(${transform.k})`);
    };

    if (svgEl) {
      const svg: any = select(svgEl.current);
      const z = zoom().on("zoom", (e) => zoomed(e.transform));
      if (graphContext?.resetZoom) {
        svg.call(z.transform, zoomIdentity, zoomTransform(svg.node()).invert([0, 0]));
        graphContext.setResetZoom(false);
      } else {
        svg.call(z);
      }
    }
  }, [graphContext, svgEl]);
};
