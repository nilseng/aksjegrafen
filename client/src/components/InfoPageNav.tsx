import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../AppContext";

const pages = [
  { path: "/bruksomrader", label: "Bruksområder" },
  { path: "/kilder", label: "Kilder" },
  { path: "/personvern", label: "Personvern" },
  { path: "/api-docs", label: "API" },
];

export const InfoPageNav = () => {
  const { theme } = useContext(AppContext);
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-wrap gap-x-4 pb-4 text-xs">
      {pages.map((page) =>
        page.path === pathname ? (
          <span key={page.path} className="font-bold" style={{ color: theme.primary }}>
            {page.label}
          </span>
        ) : (
          <Link key={page.path} to={page.path} className="underline" style={{ color: theme.muted }}>
            {page.label}
          </Link>
        )
      )}
    </nav>
  );
};
