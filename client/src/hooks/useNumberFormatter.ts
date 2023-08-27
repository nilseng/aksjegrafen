import { format } from "d3";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "./useWindowDimensions";

const defaultFormatter = (num: number) => num?.toLocaleString(navigator?.language);

export const useNumberFormatter = () => {
  const { width } = useWindowDimensions();
  const [formatNumber, setFormatNumber] = useState<(num: number) => string>(() => defaultFormatter);

  useEffect(() => {
    if (width <= 768) {
      setFormatNumber(() => format(".2s"));
    } else {
      setFormatNumber(() => defaultFormatter);
    }
  }, [width]);

  return formatNumber;
};
