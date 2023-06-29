import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { AppContext } from "../../../AppContext";
import { MenuItem } from "./GraphMenu";

export const GraphMenuItem = (item: MenuItem) => {
  const { theme } = useContext(AppContext);

  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      key={item.name}
      className="flex items-center text-xs font-bold p-3"
      style={{
        backgroundColor: hovered ? theme.backgroundSecondary : theme.background,
        color: isDisabled(item) ? theme.muted : theme.text,
        cursor: isDisabled(item) || !item.action ? "default" : "pointer",
        borderBottom: item.border ? `1px solid ${theme.muted}` : 0,
        borderRadius: "8px",
      }}
      onClick={() => {
        if (isDisabled(item) || !item.action) return;
        item.action(item.node);
      }}
      onMouseEnter={() => {
        if (!isDisabled(item) && item.action) setHovered(true);
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

const isDisabled = (item: MenuItem) => {
  return item.condition === false;
};
