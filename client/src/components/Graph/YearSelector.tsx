import { useContext } from "react";
import { AppContext } from "../../AppContext";
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
      <div
        className={graphContext.year === 2019 ? "font-weight-bold p-2" : "p-2"}
        style={
          graphContext.year === 2019
            ? { color: theme.primary }
            : { ...theme.button, color: theme.text, cursor: "pointer" }
        }
        onClick={() => handleClick(2019)}
      >
        2019
      </div>
      <div
        className={graphContext.year === 2020 ? "font-weight-bold p-2 mx-2" : "p-2 mx-2"}
        style={
          graphContext.year === 2020
            ? { color: theme.primary }
            : { ...theme.button, color: theme.text, cursor: "pointer" }
        }
        onClick={() => handleClick(2020)}
      >
        2020
      </div>
      <div
        className={graphContext.year === 2021 ? "font-weight-bold p-2" : "p-2"}
        style={
          graphContext.year === 2021
            ? { color: theme.primary }
            : { ...theme.button, color: theme.text, cursor: "pointer" }
        }
        onClick={() => handleClick(2021)}
      >
        2021
      </div>
    </div>
  );
};
