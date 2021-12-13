import { select, zoom, zoomTransform, zoomIdentity } from "d3";
import { useLayoutEffect } from "react";

export const useZoom = (
  setSvgTranslate: React.Dispatch<React.SetStateAction<string>>,
  resetZoom: boolean,
  setResetZoom: React.Dispatch<React.SetStateAction<boolean>>,
  svgEl?: React.RefObject<SVGSVGElement>
) => {
  useLayoutEffect(() => {
    const zoomed = (transform: any) => {
      setSvgTranslate(`translate(${transform.x},${transform.y}) scale(${transform.k})`);
    };

    if (svgEl) {
      const svg: any = select(svgEl.current);
      if (resetZoom) {
        const z = zoom().on("zoom", (e) => zoomed(e.transform));
        svg.call(z.transform, zoomIdentity, zoomTransform(svg.node()).invert([0, 0]));
        setResetZoom(false);
      } else {
        const z = zoom().on("zoom", (e) => zoomed(e.transform));
        svg.call(z);
      }
    }
  }, [resetZoom, setResetZoom, setSvgTranslate, svgEl]);
};
