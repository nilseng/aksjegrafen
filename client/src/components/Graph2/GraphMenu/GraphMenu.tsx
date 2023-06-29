import { faListAlt } from "@fortawesome/free-regular-svg-icons";
import { faInfo, faList, faWindowRestore, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../AppContext";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import { GraphNode, GraphNodeLabel } from "../../../models/models";
import { GraphLogo } from "../../GraphLogo";
import { GraphMenuItem } from "./GraphMenuItem";

export interface IMenuItem {
  node: GraphNode;
  name: string;
  icon?: IconDefinition;
  svgIcon?: JSX.Element;
  border?: boolean;
  action?: ((node: GraphNode) => Promise<void>) | ((node: GraphNode) => void);
  condition?: (node: GraphNode) => boolean;
}

const nodeItems: Omit<IMenuItem, "node">[] = [
  { name: "Detaljer", icon: faInfo },
  {
    name: "Åpne i ny graf",
    svgIcon: <GraphLogo width="16px" height="16px" />,
  },
  {
    name: "Åpne i ny fane",
    icon: faWindowRestore,
  },
  {
    name: "Investeringstabell",
    condition: (node: GraphNode) => !!node.labels.includes(GraphNodeLabel.Shareholder),
    icon: faListAlt,
  },
  {
    name: "Investortabell",
    condition: (node: GraphNode) => !!node.labels.includes(GraphNodeLabel.Company),
    icon: faList,
  },
];

export interface IMenu {
  open: boolean;
  node?: GraphNode;
  x?: number;
  y?: number;
}

export const GraphMenu = ({ open, node, x, y }: IMenu) => {
  const { theme } = useContext(AppContext);
  const { width, height } = useWindowDimensions();

  const [pos, setPos] = useState<{ x: number; y: number }>();

  // If there is not enough space to display the ctx menu to the right/below clicked item,
  // adjust the position with the height/width of the ctx menu.
  useEffect(() => {
    if ((x || x === 0) && (y || y === 0) && node) {
      setPos({ x: Math.min(x, width - 200), y: Math.min(y, height - 395) });
    }
    return () => setPos(undefined);
  }, [height, width, x, y, node]);

  if (!open) return null;

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
      {node && <GraphMenuItem key={node.properties.uuid} name={node.properties.name} node={node} border={true} />}
      {node &&
        nodeItems?.map((item) => {
          return <GraphMenuItem key={item.name} node={node} {...item} action={() => console.log(item)} />;
        })}
    </div>
  );
};
