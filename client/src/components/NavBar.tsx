import "./NavBar.scss";

import { faCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { resetGraph } from "../slices/graphSlice";
import { resetModal } from "../slices/modalSlice";
import { useAppDispatch } from "../store";
import { theming } from "../theming/theme";
import { GraphLogo } from "./GraphLogo";
import { NeuButton } from "./NeuButton";
import { ThemeButton } from "./ThemeButton";

interface IProps {
  theme: typeof theming.light;
  setTheme: React.Dispatch<React.SetStateAction<typeof theming.light>>;
}

const NavBar = ({ theme, setTheme }: IProps) => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex justify-between items-center p-4" style={{ zIndex: 10000 }}>
      <Link
        to="/"
        aria-label="Home"
        onClick={() => {
          dispatch(resetGraph());
          dispatch(resetModal());
        }}
      >
        <NeuButton
          className="h-12 w-12 p-2"
          ariaLabel="Home"
          style={{ borderRadius: "100%" }}
          componentIcon={<GraphLogo inputColor={theme.primary} />}
        />
      </Link>
      <div className="flex justify-end">
        <div className="flex items-center">
          <Link to="/api-docs" aria-label="API Documentation">
            <NeuButton
              className="px-4 py-2 mr-4"
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
