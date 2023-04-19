import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { availableYears } from "../../config";
import { GraphContext, Year } from "./GraphContainer";

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
    <div className="position-absolute d-flex m-2" style={{ userSelect: "none" }}>
      {availableYears.map((year) => (
        <div
          key={year}
          className={`p-2 mr-2 ${graphContext.year === year ? "font-weight-bold" : ""}`}
          style={{
            backgroundColor: theme.background,
            borderRadius: "8px",
            ...(graphContext.year === year
              ? { color: theme.primary, backgroundColor: theme.backgroundSecondary }
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
