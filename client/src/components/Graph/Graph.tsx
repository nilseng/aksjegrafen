import React, { useRef } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { AppContext } from "../../App";
import { useDisableTextSelect } from "../../hooks/useDisableTextSelect";
import { useMousePosition } from "../../hooks/useMousePosition";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { setCanvasStyleRatio } from "../../utils/canvasResolution";
import { drawNode } from "./drawNode";

export const Graph = () => {
  const { theme } = useContext(AppContext);

  const { width, height } = useWindowDimensions();
  useDisableTextSelect();
  const mousePos = useMousePosition();

  useEffect(() => {
    if (canvasRef.current) {
      if (mousePos && mousePos?.x > 500) {
        canvasRef.current.style.cursor = "pointer";
      } else {
        canvasRef.current.style.cursor = "auto";
      }
    }
  }, [mousePos]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    setCanvasStyleRatio(canvas, context, width, height);

    if (canvas) {
      drawNode(canvas, theme);
    }
  }, [height, theme, width]);

  return (
    <canvas
      ref={canvasRef}
      id="myCanvas"
      className="fixed-top"
      style={{ zIndex: -1 }}
      width={width}
      height={height}
      onClick={(e) => {
        e.preventDefault();
        console.log(e, width, height);
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
      }}
    ></canvas>
  );
};
