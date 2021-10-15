import {
  faWindowRestore,
  faBuilding,
  faInfo,
  faUsers,
  faAnchor,
  IconDefinition,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { AppContext } from "../../App";
import { ICompany, IShareholder } from "../../models/models";

interface IMenuItem {
  name: string;
  icon: IconDefinition;
}

const entityItems: IMenuItem[] = [
  { name: "Se detaljer", icon: faInfo },
  { name: "Åpne i nytt vindu", icon: faWindowRestore },
  { name: "Sentrér på siden", icon: faAnchor },
  { name: "Last 5 flere investorer", icon: faUsers },
  { name: "Last 5 flere investeringer", icon: faBuilding },
];

const defaultItems: IMenuItem[] = [{ name: "Tilbakestill graf", icon: faHome }];

export interface IMenu {
  open: boolean;
  entity?: ICompany | IShareholder;
  x?: number;
  y?: number;
  setMenu?: React.Dispatch<React.SetStateAction<IMenu>>;
}

export const GraphMenu = ({ open, entity, x, y, setMenu }: IMenu) => {
  const { theme } = useContext(AppContext);

  const [visibleItems, setVisibleItems] = useState<IMenuItem[]>();

  useEffect(() => {
    if (entity) setVisibleItems([...entityItems, ...defaultItems]);
    else setVisibleItems(defaultItems);
  }, [entity]);

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
        <ListGroup.Item
          key={entity._id}
          className="small font-weight-bold"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            cursor: "pointer",
            borderLeft: 0,
            borderTop: 0,
            borderRight: 0,
            borderBottom: `1px solid ${theme.muted}`,
          }}
        >
          {entity.name}
        </ListGroup.Item>
      )}
      {visibleItems?.map((item) => (
        <ListGroup.Item
          key={item.name}
          className="small font-weight-bold border-0"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            cursor: "pointer",
          }}
        >
          <FontAwesomeIcon
            icon={item.icon}
            color={theme.primary}
            style={{ cursor: "pointer" }}
            className="mr-3"
          />
          {item.name}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};
