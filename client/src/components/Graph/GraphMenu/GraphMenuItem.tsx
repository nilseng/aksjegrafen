import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { AppContext } from "../../../AppContext";
import { Year } from "../../../models/models";
import { GraphContext } from "../GraphContainer";
import { IMenuItem } from "./GraphMenu";

export const GraphMenuItem = (item: IMenuItem) => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      key={item.name}
      className="flex items-center text-xs font-bold p-3"
      style={{
        backgroundColor: hovered ? theme.backgroundSecondary : theme.background,
        color: isDisabled(item, graphContext?.year) ? theme.muted : theme.text,
        cursor: isDisabled(item, graphContext?.year) ? "default" : "pointer",
        borderLeft: 0,
        borderTop: 0,
        borderRight: 0,
        borderBottom: item.border ? `1px solid ${theme.muted}` : 0,
        borderRadius: "8px",
      }}
      onClick={() => {
        if (isDisabled(item, graphContext?.year)) return;
        else if (item.nodeAction && item.node) {
          item.nodeAction(item.node);
        } else if (item.action) {
          item.action();
        }
      }}
      onMouseEnter={() => {
        if (!isDisabled(item, graphContext?.year)) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {item.icon && (
        <div className="w-3 text-center mr-3">
          <FontAwesomeIcon icon={item.icon} color={theme.primary} style={{ cursor: "pointer" }} />
        </div>
      )}
      {item.svgIcon && <span className="w-3 mr-3">{item.svgIcon}</span>}
      {item.name}
    </div>
  );
};

const isDisabled = (item: IMenuItem, year: Year | undefined) => {
  if (!year) return true;
  return !hasAction(item) || (item.node && item.condition && !item.condition(item.node, year));
};

const hasAction = (item: IMenuItem) => {
  return item.action || item.nodeAction;
};
