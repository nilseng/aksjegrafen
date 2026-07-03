import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../AppContext";

interface IProps {
  text: string;
}

export const DataSourceNote = ({ text }: IProps) => {
  const { theme } = useContext(AppContext);
  return (
    <p className="text-center text-xs pt-1 m-0" style={{ color: theme.muted }}>
      {text} ·{" "}
      <Link to="/kilder" className="underline" style={{ color: theme.muted }}>
        om kildene
      </Link>
    </p>
  );
};
