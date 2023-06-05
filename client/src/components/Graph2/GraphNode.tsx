import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { GraphNodeDatum } from "../../slices/graphSlice";

export const GraphNode = ({ node }: { node: GraphNodeDatum }) => {
  const { theme } = useContext(AppContext);

  return (
    <div
      data-xmlns="http://www.w3.org/1999/xhtml"
      className="w-full h-full flex justify-center items-center p-4"
      style={{ userSelect: "none" }}
    >
      <div
        className="h-full w-full dark:text-white p-3"
        style={{
          ...theme.elevation,
          backgroundColor: theme.backgroundSecondary,
          cursor: "pointer",
          borderRadius: "4rem",
        }}
      >
        <div className="w-full h-full flex flex-col items-middle justify-center">
          <div className="text-center break-words font-bold text-xs">{node.properties.name}</div>
        </div>
      </div>
    </div>
  );
};
