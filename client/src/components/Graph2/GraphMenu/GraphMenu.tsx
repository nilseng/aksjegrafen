import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../AppContext";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import { GraphNode } from "../../../models/models";
import { GraphMenuItem } from "./GraphMenuItem";
import { useGraphMenu } from "./useGraphMenu";

export interface MenuItem {
  node: GraphNode;
  name: string;
  icon?: IconDefinition;
  svgIcon?: JSX.Element;
  border?: boolean;
  action?: ((node: GraphNode) => Promise<void>) | ((node: GraphNode) => void);
  condition?: boolean;
}

export interface Menu {
  open: boolean;
  node?: GraphNode;
  x?: number;
  y?: number;
}

export const GraphMenu = ({ open, node, x, y }: Menu) => {
  const { theme } = useContext(AppContext);
  const { width, height } = useWindowDimensions();

  const [pos, setPos] = useState<{ x: number; y: number }>();

  const menuItems = useGraphMenu(node);

  // If there is not enough space to display the ctx menu to the right/below clicked item,
  // adjust the position with the height/width of the ctx menu.
  useEffect(() => {
    if ((x || x === 0) && (y || y === 0) && node) {
      setPos({ x: Math.min(x, width - 200), y: Math.min(y, height - (80 + 36 * (menuItems?.length ?? 0))) });
    }
    return () => setPos(undefined);
  }, [height, width, x, y, node, menuItems?.length]);

  if (!open || !node || !menuItems) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: pos?.y ?? y,
        left: pos?.x ?? x,
        backgroundColor: theme.background,
        ...theme.elevation,
        borderRadius: "8px",
      }}
    >
      {menuItems?.map((item) => (
        <GraphMenuItem
          key={item.name}
          name={item.name}
          node={node}
          icon={item.icon}
          svgIcon={item.svgIcon}
          action={item.action}
          border={item.border}
        />
      ))}
    </div>
  );
};
