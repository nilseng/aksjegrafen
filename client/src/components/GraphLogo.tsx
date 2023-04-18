import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";

interface IProps {
  inputColor?: string;
  width?: string;
  height?: string;
}

export const GraphLogo = ({ inputColor, width, height }: IProps) => {
  const [color, setColor] = useState<string>();
  const { theme } = useContext(AppContext);

  useEffect(() => {
    setColor(inputColor ?? theme.primary);
  }, [inputColor, theme]);

  return (
    <svg
      height={height ?? "100%"}
      style={{
        fillRule: "nonzero",
        clipRule: "evenodd",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={width ?? "100%"}
      version="1.1"
      viewBox="0 0 1024 1024"
    >
      <defs />
      <g id="Layer 1">
        <path
          stroke={color}
          strokeWidth="6.60137"
          d="M35.9769+341.662C35.9769+291.957+76.2713+251.662+125.977+251.662C175.683+251.662+215.977+291.957+215.977+341.662C215.977+391.368+175.683+431.662+125.977+431.662C76.2713+431.662+35.9769+391.368+35.9769+341.662Z"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="6.60137"
          d="M7.97694+768.589C7.97694+702.315+61.7028+648.589+127.977+648.589C194.251+648.589+247.977+702.315+247.977+768.589C247.977+834.864+194.251+888.589+127.977+888.589C61.7028+888.589+7.97694+834.864+7.97694+768.589Z"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="6.60137"
          d="M520.477+159.589C520.477+93.3152+574.203+39.5894+640.477+39.5894C706.751+39.5894+760.477+93.3152+760.477+159.589C760.477+225.864+706.751+279.589+640.477+279.589C574.203+279.589+520.477+225.864+520.477+159.589Z"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="6.60137"
          d="M544.477+864.089C544.477+797.815+598.203+744.089+664.477+744.089C730.751+744.089+784.477+797.815+784.477+864.089C784.477+930.364+730.751+984.089+664.477+984.089C598.203+984.089+544.477+930.364+544.477+864.089Z"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="56.603"
          d="M744.91+511.832C744.91+445.558+798.636+391.832+864.91+391.832C931.184+391.832+984.91+445.558+984.91+511.832C984.91+578.107+931.184+631.832+864.91+631.832C798.636+631.832+744.91+578.107+744.91+511.832Z"
          fill="none"
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="23.7732"
          d="M392.477+505.666C392.477+449.015+438.38+403.089+495.004+403.089C551.628+403.089+597.53+449.015+597.53+505.666C597.53+562.318+551.628+608.243+495.004+608.243C438.38+608.243+392.477+562.318+392.477+505.666Z"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="40"
          d="M214.477+693.589L411.681+561.923"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="40"
          d="M398.477+450.089L200.977+362.589"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="40"
          d="M536.689+420.889L597.977+255.589"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="40"
          d="M617.477+762.589L530.919+606.157"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
        <path
          stroke={color}
          strokeWidth="40"
          d="M604+516.408L715.546+518.331"
          fill={color}
          strokeLinecap="round"
          opacity="1"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
