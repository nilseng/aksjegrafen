import { useContext } from "react";
import { AppContext } from "../AppContext";
import { useCompanyCount } from "../services/apiService";

export const Stats = () => {
  const { theme } = useContext(AppContext);

  const ASACount = useCompanyCount(" ASA");

  return (
    <div className="container" style={{ color: theme.text }}>
      Allmennaksjeselskaper: {ASACount}
    </div>
  );
};
