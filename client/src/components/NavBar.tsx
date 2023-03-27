import "./NavBar.scss";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
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
    <div className="d-flex justify-content-between align-items-center p-3" style={{ zIndex: 10000 }}>
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
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center">
          <Link to="/search" className="mr-4">
            <button className="btn btn-sm py-2" aria-label="test" style={{ ...theme.button, color: theme.primary }}>
              Enhetsregisteret
              <FontAwesomeIcon icon={faSearch} className="ml-2" />
            </button>
          </Link>
          <ThemeButton theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
