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
import { ThemeIcon } from "./ThemeIcon";

interface IProps {
  theme: typeof theming.light;
  setTheme: React.Dispatch<React.SetStateAction<typeof theming.light>>;
}

// 16px padding + 44px control + 16px padding. App.tsx sizes the main area against this.
export const NAV_BAR_HEIGHT = 76;

// 44px is the minimum comfortable touch target, and every control in the bar shares it
// so the row keeps a single baseline at any width.
const controlClassName = "h-11 px-3 sm:px-4";
// Without nowrap the labels break onto a second line once the icon no longer fits.
const labelClassName = "text-xs text-primary font-bold whitespace-nowrap";

const NavBar = ({ theme, setTheme }: IProps) => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  // Keep the offer CTA out of the graph itself — the app stays clean for tool users.
  const showOfferCta = !pathname.startsWith("/graf");

  const toggleTheme = () => {
    localStorage.setItem("theme", theme.id === "light" ? "dark" : "light");
    setTheme((t) => (t.id === "light" ? theming.dark : theming.light));
  };

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
          className="h-11 w-11 p-2.5"
          ariaLabel="Home"
          style={{ borderRadius: "100%" }}
          componentIcon={<GraphLogo inputColor={theme.primary} />}
        />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        {showOfferCta && (
          <a href="/eierskapssjekk" aria-label="Gratis eierskapssjekk" className="hidden sm:block">
            <NeuButton
              className={controlClassName}
              ariaLabel="Gratis eierskapssjekk"
              componentIcon={<span className={labelClassName}>Eierskapssjekk</span>}
            />
          </a>
        )}
        {/* Plain anchor: /selskaper is server-rendered, and the link makes the
            company catalog crawlable from the indexed homepage. Visible on all
            breakpoints — mobile-first indexing ignores mobile-hidden links. */}
        <a href="/selskaper" aria-label="Alle selskaper">
          <NeuButton
            className={controlClassName}
            ariaLabel="Alle selskaper"
            componentIcon={<span className={labelClassName}>Selskaper</span>}
          />
        </a>
        <Link to="/bruksomrader" aria-label="Om Aksjegrafen">
          <NeuButton
            className={controlClassName}
            ariaLabel="Om Aksjegrafen"
            componentIcon={
              <span className={labelClassName}>
                Om
                <FontAwesomeIcon icon={faInfoCircle} className="hidden sm:inline-block ml-2" />
              </span>
            }
          />
        </Link>
        <Link to="/api-docs" aria-label="API Documentation">
          <NeuButton
            className={controlClassName}
            ariaLabel="API Documentation"
            componentIcon={
              <span className={labelClassName}>
                API
                <FontAwesomeIcon icon={faCode} className="hidden sm:inline-block ml-2" />
              </span>
            }
          />
        </Link>
        <NeuButton
          className="h-11 w-11"
          ariaLabel={theme.id === "light" ? "Bytt til mørkt tema" : "Bytt til lyst tema"}
          action={toggleTheme}
          componentIcon={<ThemeIcon theme={theme} />}
        />
      </div>
    </div>
  );
};

export default NavBar;
