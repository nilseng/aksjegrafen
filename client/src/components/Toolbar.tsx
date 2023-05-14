import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AppContext } from "../AppContext";

export const Toolbar = () => {
  const { theme } = useContext(AppContext);
  return (
    <div className="btn position-absolute p-2 mr-2 mr-sm-4 mb-2 mb-sm-4" style={{ right: 0 }}>
      <button className="btn" style={{ backgroundColor: theme.backgroundSecondary, border: 0, ...theme.button }}>
        <FontAwesomeIcon size="lg" className="m-2" style={{ color: theme.primary }} icon={faSearch} />
      </button>
    </div>
  );
};
