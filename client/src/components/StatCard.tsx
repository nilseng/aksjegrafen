import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AppContext } from "../AppContext";
import Loading from "./Loading";

interface IProps {
  label?: string;
  labelIcon?: IconDefinition;
  stat?: string | number;
}

export const StatCard = ({ label, stat, labelIcon }: IProps) => {
  const { theme } = useContext(AppContext);
  return (
    <div
      className="flex flex-col items-center p-2 mx-4"
      style={{
        backgroundColor: theme.background,
        ...theme.lowering,
        width: "10rem",
        minHeight: "5rem",
      }}
    >
      {stat && <p className="text-2xl pb-2">{(+stat)?.toLocaleString(navigator?.language)}</p>}
      {!stat && <Loading backgroundColor="transparent" height="2.25rem" color={theme.primary} />}
      <span className="m-0" style={{ color: theme.primary }}>
        {labelIcon && <FontAwesomeIcon icon={labelIcon} className="mr-2" />}
        {label}
      </span>
    </div>
  );
};
