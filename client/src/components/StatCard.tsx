import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AppContext } from "../App";

interface IProps {
  label?: string;
  labelIcon?: IconDefinition;
  stat?: string | number;
}

export const StatCard = ({ label, stat, labelIcon }: IProps) => {
  const { theme } = useContext(AppContext);
  return (
    <div
      className="d-flex flex-column align-items-center p-2 mx-4"
      style={{
        backgroundColor: theme.background,
        ...theme.elevation,
        width: "10rem",
        minHeight: "5rem",
      }}
    >
      <p className="h4">{stat?.toLocaleString()}</p>
      <span className="m-0" style={{ color: theme.primary }}>
        {labelIcon && <FontAwesomeIcon icon={labelIcon} className="mr-2" />}
        {label}
      </span>
    </div>
  );
};
