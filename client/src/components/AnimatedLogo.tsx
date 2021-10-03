import React from "react";

const AnimatedLogo = ({
  color = "#1c2e3f",
  height = "5rem",
  width = "5rem",
  style = {},
}) => {
  return (
    <svg
      style={{
        height: height,
        width: width,
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 60"
    >
      <circle cx="30" cy="10" r="3" fill={color} />
      <line x1="30" x2="15" y1="10" y2="30" stroke={color} />
      <circle cx="15" cy="30" r="3" fill={color} />
      <line x1="30" x2="45" y1="10" y2="30" stroke={color} />
      <circle cx="45" cy="30" r="3" fill={color} />
      <line x1="15" x2="5" y1="30" y2="50" stroke={color} />
      <circle cx="5" cy="50" r="3" fill={color} />
      <line x1="15" x2="25" y1="30" y2="50" stroke={color} />
      <circle cx="25" cy="50" r="3" fill={color} />
      <line x1="45" x2="35" y1="30" y2="50" stroke={color} />
      <circle cx="35" cy="50" r="3" fill={color} />
      <line x1="45" x2="55" y1="30" y2="50" stroke={color}>
        <animate
          attributeName="x2"
          values="45;55;45"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y2"
          values="30;50;30"
          dur="2s"
          repeatCount="indefinite"
        />
      </line>
      <circle cx="75" cy="50" r="3" fill={color}>
        <animate
          attributeName="cx"
          values="45;55;45"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="30;50;30"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default AnimatedLogo;
