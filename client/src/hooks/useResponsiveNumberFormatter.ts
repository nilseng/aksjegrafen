import { format } from "d3";
import { useLayoutEffect, useState } from "react";
import { useWindowDimensions } from "./useWindowDimensions";

const defaultFormatter = (num: number) => num?.toLocaleString(navigator?.language);

export const useResponsiveNumberFormatter = () => {
  const { width } = useWindowDimensions();
  const [formatNumber, setFormatNumber] = useState<(num: number) => string>(() => defaultFormatter);

  useLayoutEffect(() => {
    if (width <= 768) {
      setFormatNumber(() => format(".2s"));
    } else {
      setFormatNumber(() => defaultFormatter);
    }
  }, [width]);

  return formatNumber;
};
