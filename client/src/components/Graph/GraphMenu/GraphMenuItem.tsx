import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { AppContext } from "../../../App";
import { IMenuItem } from "./GraphMenu";

export const GraphMenuItem = ({
  name,
  icon,
  svgIcon,
  border,
  action,
}: IMenuItem) => {
  const { theme } = useContext(AppContext);

  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <ListGroup.Item
      key={name}
      className="small font-weight-bold"
      style={{
        backgroundColor: hovered ? theme.backgroundSecondary : theme.background,
        color: theme.text,
        cursor: action ? "pointer" : "default",
        borderLeft: 0,
        borderTop: 0,
        borderRight: 0,
        borderBottom: border ? `1px solid ${theme.muted}` : 0,
      }}
      onClick={() => {
        if (action?.action) {
          action.action();
        }
      }}
      onMouseEnter={() => {
        if (action) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          color={theme.primary}
          style={{ cursor: "pointer" }}
          className="mr-3"
        />
      )}
      {svgIcon && <span className="mr-3">{svgIcon}</span>}
      {name}
    </ListGroup.Item>
  );
};
