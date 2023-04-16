import { faListAlt } from "@fortawesome/free-regular-svg-icons";
import {
  faBuilding,
  faHome,
  faInfo,
  faList,
  faUsers,
  faWindowRestore,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { AppContext } from "../../../App";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import { GraphLogo } from "../../GraphLogo";
import { GraphContext, IGraphDefaultActions, IGraphNodeActions, Year } from "../GraphContainer";
import { IGraphNode } from "../GraphUtils";
import { GraphMenuItem } from "./GraphMenuItem";

export interface IMenuItem {
  node?: IGraphNode;
  name: string;
  icon?: IconDefinition;
  svgIcon?: JSX.Element;
  border?: boolean;
  nodeActionId?: keyof IGraphNodeActions;
  nodeAction?: ((node: IGraphNode) => Promise<void>) | ((node: IGraphNode) => void);
  actionId?: keyof IGraphDefaultActions;
  action?: (() => Promise<void>) | (() => void);
  condition?: (node: IGraphNode, year: Year) => boolean;
}

const nodeItems: IMenuItem[] = [
  { nodeActionId: "showDetails", name: "Detaljer", icon: faInfo },
  {
    nodeActionId: "openInNewGraph",
    name: "Åpne i ny graf",
    svgIcon: <GraphLogo width="16px" height="16px" />,
  },
  {
    nodeActionId: "openInNewWindow",
    name: "Åpne i ny fane",
    icon: faWindowRestore,
  },
  {
    nodeActionId: "loadInvestors",
    name: "Flere investorer",
    condition: (node: IGraphNode, year: Year) =>
      !!(node.entity.investorCount && (node.entity.investorCount[year] || 0) > (node.loadedInvestors || 0)),
    icon: faUsers,
  },
  {
    nodeActionId: "loadInvestments",
    name: "Flere investeringer",
    condition: (node: IGraphNode, year: Year) =>
      !!(node.entity.investmentCount && (node.entity.investmentCount[year] || 0) > (node.loadedInvestments || 0)),
    icon: faBuilding,
  },
  {
    nodeActionId: "showInvestmentTable",
    name: "Investeringstabell",
    condition: (node: IGraphNode) => !!node.entity.investmentCount,
    icon: faListAlt,
  },
  {
    nodeActionId: "showInvestorTable",
    name: "Investortabell",
    condition: (node: IGraphNode) => !!node.entity.investorCount,
    icon: faList,
  },
];

const defaultItems: IMenuItem[] = [{ actionId: "resetGraph", name: "Tilbakestill graf", icon: faHome }];

export interface IMenu {
  open: boolean;
  node?: IGraphNode;
  x?: number;
  y?: number;
  setMenu?: React.Dispatch<React.SetStateAction<IMenu>>;
}

export const GraphMenu = ({ open, node, x, y, setMenu }: IMenu) => {
  const { theme } = useContext(AppContext);
  const { width, height } = useWindowDimensions();

  const graphContext = useContext(GraphContext);

  const [pos, setPos] = useState<{ x: number; y: number }>();

  // If there is not enough space to display the ctx menu to the right/below clicked item,
  // adjust the position with the height/width of the ctx menu.
  useEffect(() => {
    if ((x || x === 0) && (y || y === 0) && node) {
      setPos({ x: Math.min(x, width - 200), y: Math.min(y, height - 395) });
    }
    return () => setPos(undefined);
  }, [height, width, x, y, node]);

  if (!open || !graphContext) return null;

  return (
    <ListGroup
      style={{
        position: "absolute",
        top: pos?.y ?? y,
        left: pos?.x ?? x,
        backgroundColor: theme.background,
        ...theme.elevation,
      }}
      onClick={() => {
        if (setMenu) setMenu((menu) => ({ ...menu, open: false }));
      }}
    >
      {node?.entity && <GraphMenuItem key={node.id} name={node.entity.name} border={true} />}
      {node &&
        nodeItems?.map((item) => {
          if (!item.nodeActionId) return null;
          return (
            <GraphMenuItem
              key={item.name}
              node={node}
              {...item}
              nodeAction={graphContext?.nodeActions[item.nodeActionId]}
            />
          );
        })}
      {defaultItems?.map((item) => {
        if (!item.actionId) return null;
        return <GraphMenuItem key={item.name} {...item} action={graphContext?.actions[item.actionId]} />;
      })}
    </ListGroup>
  );
};
