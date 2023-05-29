import "./NavBar.scss";

import { faCode, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { theming } from "../theming/theme";
import { GraphLogo } from "./GraphLogo";
import { ThemeButton } from "./ThemeButton";

interface IProps {
  theme: typeof theming.light;
  setTheme: React.Dispatch<React.SetStateAction<typeof theming.light>>;
}

const NavBar = ({ theme, setTheme }: IProps) => {
  return (
    <div className="flex justify-between items-center p-4" style={{ zIndex: 10000 }}>
      <Link to="/">
        <span
          style={{
            ...theme.button,
            borderRadius: "100px",
            display: "inline-block",
            textAlign: "center",
            verticalAlign: "middle",
            width: "3.2rem",
            height: "3.2rem",
            paddingTop: "0.6rem",
            paddingBottom: "0.6rem",
          }}
        >
          <GraphLogo inputColor={theme.primary} />
        </span>
      </Link>
      <div className="flex justify-end">
        <div className="flex items-center">
          <Link to="/search" className="mr-2">
            <button className="text-sm p-2" aria-label="test" style={{ ...theme.button, color: theme.primary }}>
              Avansert søk
              <FontAwesomeIcon icon={faSearch} className="ml-2" />
            </button>
          </Link>
          <Link to="/api-docs" className="mr-4">
            <button className="text-sm p-2" aria-label="test" style={{ ...theme.button, color: theme.primary }}>
              API
              <FontAwesomeIcon icon={faCode} className="ml-2" />
            </button>
          </Link>
          <ThemeButton theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
