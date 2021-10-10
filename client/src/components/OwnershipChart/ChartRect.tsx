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

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={theme.background}
      shadowColor={theme.shadowColor}
      shadowBlur={6}
      cornerRadius={4}
      shadowOpacity={0.2}
      onClick={handleClick}
    />
  );
};
