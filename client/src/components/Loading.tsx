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
      className="d-flex flex-column justify-content-center align-items-center w-100"
      style={{ height, margin, backgroundColor, ...(style ? style : {}) }}
    >
      <AnimatedLogo color={color} />
      <p className="small text-light">{text}</p>
    </div>
  );
};

export default Loading;
