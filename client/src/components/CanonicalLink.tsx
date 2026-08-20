import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Keeps <link rel="canonical"> in sync with the route. Query params are dropped so
// all graph variants (?graphType=...&sourceUuid=...) consolidate to the clean path.
export const CanonicalLink = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}${pathname === "/" ? "/" : pathname}`;
  }, [pathname]);

  return null;
};
