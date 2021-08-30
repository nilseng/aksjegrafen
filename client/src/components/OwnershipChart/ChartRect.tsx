import { useEffect, useState } from "react";
import { Rect } from "react-konva";

interface IChartRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  theme: any;
}

export const ChartRect = ({ x, y, width, height, theme }: IChartRectProps) => {
  const handleClick = (e: any) => {
    console.log(e);
  };
  const [offset, setOffset] = useState<{ x: number; y: number }>();

  useEffect(() => {
    setOffset({ x: width / 2, y: height / 2 });
  }, [height, width]);

  if (!offset) return null;

  return (
    <Rect
      x={x - offset.x}
      y={y - offset.y}
      width={width}
      height={height}
      fill={theme.background}
      shadowColor={theme.shadowColor}
      shadowBlur={3}
      cornerRadius={4}
      shadowOpacity={0.2}
      onClick={handleClick}
    />
  );
};
