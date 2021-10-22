import {
  faWindowRestore,
  faBuilding,
  faInfo,
  faUsers,
  faAnchor,
  IconDefinition,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { AppContext } from "../../../App";
import { ICompany, IShareholder } from "../../../models/models";
import { GraphContext, IGraphContext } from "../Graph";
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
  { name: "Åpne i nytt vindu", icon: faWindowRestore },
  { name: "Sentrér på siden", icon: faAnchor },
  {
    name: "Last 5 flere investorer",
    icon: faUsers,
    action: { name: "loadInvestors" },
  },
  {
    name: "Last 5 flere investeringer",
    icon: faBuilding,
    action: { name: "loadInvestments" },
  },
];

const defaultItems: IMenuItem[] = [
  { name: "Tilbakestill graf", icon: faHome, action: { name: "resetGraph" } },
];

export interface IMenu {
  open: boolean;
  entity?: ICompany | IShareholder;
  x?: number;
  y?: number;
  setMenu?: React.Dispatch<React.SetStateAction<IMenu>>;
}

export const GraphMenu = ({ open, entity, x, y, setMenu }: IMenu) => {
  const { theme } = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  const [visibleItems, setVisibleItems] = useState<IMenuItem[]>();

  useEffect(() => {
    if (entity) {
      const items = [...entityItems, ...defaultItems];
      if (graphContext.actions) {
        for (const item of items) {
          switch (item.action?.name) {
            case "loadInvestors":
              item.action.action = () => {
                if (graphContext.actions.loadInvestors) {
                  graphContext.actions.loadInvestors(entity);
                }
              };
              break;
            case "loadInvestments":
              item.action.action = () => {
                if (graphContext.actions.loadInvestments) {
                  graphContext.actions.loadInvestments(entity);
                }
              };
              break;
            case "resetGraph":
              item.action.action = () => {
                if (graphContext.actions.resetGraph) {
                  graphContext.actions.resetGraph();
                }
              };
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
  }, [entity, graphContext.actions]);

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
      {entity && (
        <GraphMenuItem key={entity._id} name={entity.name} border={true} />
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
