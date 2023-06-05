import "./NavBar.scss";

import { faCode, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { theming } from "../theming/theme";
import { GraphLogo } from "./GraphLogo";
import { NeuButton } from "./NeuButton";
import { ThemeButton } from "./ThemeButton";

interface IProps {
  theme: typeof theming.light;
  setTheme: React.Dispatch<React.SetStateAction<typeof theming.light>>;
}

const NavBar = ({ theme, setTheme }: IProps) => {
  return (
    <div className="flex justify-between items-center p-4" style={{ zIndex: 10000 }}>
      <Link to="/" aria-label="Home">
        <NeuButton
          className="h-12 w-12 p-2"
          ariaLabel="Home"
          style={{ borderRadius: "100%" }}
          componentIcon={<GraphLogo inputColor={theme.primary} />}
        />
      </Link>
      <div className="flex justify-end">
        <div className="flex items-center">
          <Link to="/search" aria-label="Avansert søk">
            <NeuButton
              className="p-2 mr-2"
              ariaLabel="Avansert søk"
              componentIcon={
                <div className="text-xs text-primary font-bold">
                  Avansert søk
                  <FontAwesomeIcon icon={faSearch} className="ml-2" />
                </div>
              }
            />
          </Link>
          <Link to="/api-docs" aria-label="API Documentation">
            <NeuButton
              className="p-2 mr-2"
              ariaLabel="API Documentation"
              componentIcon={
                <div className="text-xs text-primary font-bold">
                  API
                  <FontAwesomeIcon icon={faCode} className="ml-2" />
                </div>
              }
            />
          </Link>
          <NeuButton
            style={{ borderRadius: "4rem" }}
            componentIcon={<ThemeButton theme={theme} setTheme={setTheme} />}
          />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
