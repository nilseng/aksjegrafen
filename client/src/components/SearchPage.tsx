import { useContext } from "react";
import { AppContext } from "../App";

export const SearchPage = () => {
  const { theme } = useContext(AppContext);

  return <div style={{ color: theme.text }}></div>;
};
