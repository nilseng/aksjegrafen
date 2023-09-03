import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { CurrentRole, GraphNode as IGraphNode } from "../../models/models";

const getBorder = (node: IGraphNode): string => {
  const borders = [];
  if (node.currentRoles?.includes(CurrentRole.Actor)) borders.push("border-r-warning");
  if (node.currentRoles?.includes(CurrentRole.Unit)) borders.push("border-l-success");
  if (node.currentRoles?.includes(CurrentRole.Investment)) borders.push("border-t-primary");
  if (node.currentRoles?.includes(CurrentRole.Investor)) borders.push("border-b-secondary");
  return borders.join(" ");
};

export const GraphNode = ({ node }: { node: IGraphNode }) => {
  const { theme } = useContext(AppContext);

  return (
    <div
      data-xmlns="http://www.w3.org/1999/xhtml"
      className="w-full h-full flex justify-center items-center p-4"
      style={{ userSelect: "none" }}
    >
      <div
        className={`h-full w-full dark:text-white border-2 border-transparent ${getBorder(node)} p-3`}
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
