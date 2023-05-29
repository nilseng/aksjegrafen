import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { availableYears } from "../../config";
import { Year } from "../../models/models";
import { GraphContext } from "./GraphContainer";

export const YearSelector = () => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const handleClick = (year: Year) => {
    if (graphContext) {
      graphContext.setYear(year);
      graphContext.setResetZoom(true);
    }
  };

  if (!graphContext) return null;

  return (
    <div className="absolute flex m-2" style={{ userSelect: "none" }}>
      {availableYears.map((year) => (
        <div
          key={year}
          className={`p-2 mr-2 ${graphContext.year === year ? "font-bold" : ""}`}
          style={{
            backgroundColor: theme.backgroundSecondary,
            borderRadius: "8px",
            ...(graphContext.year === year
              ? { color: theme.primary }
              : {
                  ...theme.button,
                  color: theme.text,
                  cursor: "pointer",
                }),
          }}
          onClick={() => handleClick(year)}
        >
          {year}
        </div>
      ))}
    </div>
  );
};
