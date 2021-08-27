import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { theming } from "../theming/theme";

interface IProps {
  theme: any;
  setTheme: React.Dispatch<React.SetStateAction<any>>;
}

export const ThemeButton = ({ theme, setTheme }: IProps) => {
  return (
    <div
      style={{
        backgroundColor: theme.text,
        width: "4rem",
        height: "2rem",
        borderRadius: "4rem",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow:
          theme.id === "light"
            ? "inset 0px 0px 4px 0px rgba(255,255,255,0.5)"
            : "inset 0px 0px 4px 0px rgba(0,0,0,0.5)",
      }}
      onClick={() => {
        localStorage.setItem("theme", theme.id === "light" ? "dark" : "light");
        setTheme((t: any) => (t.id === "light" ? theming.dark : theming.light));
      }}
    >
      <FontAwesomeIcon
        className="mx-2"
        icon={faSun}
        color={theme.background}
        style={{ visibility: theme.id === "light" ? "visible" : "hidden" }}
      />
      <FontAwesomeIcon
        className="mx-2"
        icon={faMoon}
        color={theme.primary}
        style={{ visibility: theme.id === "dark" ? "visible" : "hidden" }}
      />
    </div>
  );
};
