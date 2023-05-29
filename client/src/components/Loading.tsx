import { CSSProperties } from "react";
import AnimatedLogo from "./AnimatedLogo";

interface IProps {
  text?: string;
  height?: string;
  margin?: string;
  color?: string;
  backgroundColor?: string;
  style?: CSSProperties;
}

const Loading = ({ text, height, margin, color = "#faf8f9", backgroundColor = "#343a40", style }: IProps) => {
  return (
    <div
      className="flex flex-col justify-center items-center w-full"
      style={{ height, margin, backgroundColor, ...(style ? style : {}) }}
    >
      <AnimatedLogo color={color} />
      <p className="text-sm" style={{ color }}>
        {text}
      </p>
    </div>
  );
};

export default Loading;
