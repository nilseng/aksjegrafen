import { select, zoom } from "d3";
import { useLayoutEffect, useState } from "react";

export const defaultSvgTransform = "translate(0,0) scale(1)";

export const useZoom = (svgEl: React.RefObject<SVGSVGElement>) => {
  const [svgTransform, setSvgTransform] = useState<string>(defaultSvgTransform);

  useLayoutEffect(() => {
    const zoomed = (transform: any) => {
      setSvgTransform(`translate(${transform.x},${transform.y}) scale(${transform.k})`);
    };

    const svg: any = select(svgEl.current);
    const z = zoom().on("zoom", (e) => zoomed(e.transform));
    svg.call(z);

    return () => {
      setSvgTransform(defaultSvgTransform);
    };
  }, [svgEl]);

  return svgTransform;
};
