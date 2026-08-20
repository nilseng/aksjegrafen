import "./NavBar.scss";

import { faCode, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  // Keep the offer CTA out of the graph itself — the app stays clean for tool users.
  const showOfferCta = !pathname.startsWith("/graf");

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
          {showOfferCta && (
            <a href="/eierskapssjekk" aria-label="Gratis eierskapssjekk" className="hidden sm:block">
              <NeuButton
                className="px-4 py-2 mr-4"
                ariaLabel="Gratis eierskapssjekk"
                componentIcon={<span className="text-xs text-primary font-bold">Eierskapssjekk</span>}
              />
            </a>
          )}
          {/* Plain anchor: /selskaper is server-rendered, and the link makes the
              company catalog crawlable from the indexed homepage. Visible on all
              breakpoints — mobile-first indexing ignores mobile-hidden links. */}
          <a href="/selskaper" aria-label="Alle selskaper">
            <NeuButton
              className="px-4 py-2 mr-4"
              ariaLabel="Alle selskaper"
              componentIcon={<span className="text-xs text-primary font-bold">Selskaper</span>}
            />
          </a>
          <Link to="/bruksomrader" aria-label="Om Aksjegrafen">
            <NeuButton
              className="px-4 py-2 mr-4"
              ariaLabel="Om Aksjegrafen"
              componentIcon={
                <span className="text-xs text-primary font-bold">
                  Om
                  <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                </span>
              }
            />
          </Link>
          <Link to="/api-docs" aria-label="API Documentation">
            <NeuButton
              className="px-4 py-2 mr-4"
              ariaLabel="API Documentation"
              componentIcon={
                <span className="text-xs text-primary font-bold">
                  API
                  <FontAwesomeIcon icon={faCode} className="ml-2" />
                </span>
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
