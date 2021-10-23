import {
  faWindowRestore,
  faBuilding,
  faInfo,
  faUsers,
  IconDefinition,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { AppContext } from "../../../App";
import { GraphContext, IGraphContext } from "../Graph";
import { IGraphNode } from "../GraphUtils";
import { GraphMenuItem } from "./GraphMenuItem";

export interface IMenuItem {
  name: string;
  icon?: IconDefinition;
  border?: boolean;
  action?: {
    name: keyof IGraphContext["actions"];
    action?: Function;
  };
}

const entityItems: IMenuItem[] = [
  { name: "Se detaljer", icon: faInfo },
  {
    name: "Åpne i nytt vindu",
    icon: faWindowRestore,
    action: { name: "openInNewWindow" },
  },
  {
    name: "Last flere investorer",
    icon: faUsers,
    action: { name: "loadInvestors" },
  },
  {
    name: "Last flere investeringer",
    icon: faBuilding,
    action: { name: "loadInvestments" },
  },
];

const defaultItems: IMenuItem[] = [
  { name: "Tilbakestill graf", icon: faHome, action: { name: "resetGraph" } },
];

export interface IMenu {
  open: boolean;
  node?: IGraphNode;
  x?: number;
  y?: number;
  setMenu?: React.Dispatch<React.SetStateAction<IMenu>>;
}

export const GraphMenu = ({ open, node, x, y, setMenu }: IMenu) => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const [visibleItems, setVisibleItems] = useState<IMenuItem[]>();

  useEffect(() => {
    if (node?.entity) {
      const items = [...entityItems, ...defaultItems];
      if (graphContext.actions) {
        for (const item of items) {
          switch (item.action?.name) {
            case "loadInvestors":
              item.action.action = () => {
                if (graphContext.actions.loadInvestors) {
                  const investorCount = node.loadedInvestors ?? 0;
                  graphContext.actions.loadInvestors(
                    node.entity,
                    investorCount
                  );
                }
              };
              break;
            case "loadInvestments":
              item.action.action = () => {
                if (graphContext.actions.loadInvestments) {
                  const investmentCount = node.loadedInvestments ?? 0;
                  graphContext.actions.loadInvestments(
                    node.entity,
                    investmentCount
                  );
                }
              };
              break;
            case "resetGraph":
              item.action.action = () => {
                if (graphContext.actions.resetGraph) {
                  graphContext.actions.resetGraph();
                }
              };
              break;
            case "openInNewWindow":
              item.action.action = () => {
                if (graphContext.actions.openInNewWindow) {
                  graphContext.actions.openInNewWindow(node.entity);
                }
              };
              break;
          }
        }
      }
      setVisibleItems(items);
    } else {
      for (const item of defaultItems) {
        if (item.action?.name === "resetGraph") {
          item.action.action = () => {
            if (graphContext.actions.resetGraph) {
              graphContext.actions.resetGraph();
            }
          };
        }
      }
      setVisibleItems(defaultItems);
    }
  }, [node, graphContext.actions]);

  if (!open) return null;

  return (
    <ListGroup
      style={{
        position: "absolute",
        top: y,
        left: x,
        backgroundColor: theme.background,
        ...theme.elevation,
      }}
      onClick={() => {
        if (setMenu) setMenu((menu) => ({ ...menu, open: false }));
      }}
    >
      {node?.entity && (
        <GraphMenuItem key={node.id} name={node.entity.name} border={true} />
      )}
      {visibleItems?.map((item) => (
        <GraphMenuItem
          key={item.name}
          name={item.name}
          action={item.action}
          icon={item.icon}
        />
      ))}
    </ListGroup>
  );
};
