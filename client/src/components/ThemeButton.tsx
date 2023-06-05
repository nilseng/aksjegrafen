import { faMoon } from "@fortawesome/free-regular-svg-icons";
import { faSun } from "@fortawesome/free-solid-svg-icons";
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
        backgroundColor: theme.backgroundColor,
        width: "4rem",
        height: "2rem",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => {
        localStorage.setItem("theme", theme.id === "light" ? "dark" : "light");
        setTheme((t: any) => (t.id === "light" ? theming.dark : theming.light));
      }}
    >
      <FontAwesomeIcon
        className="mx-2"
        icon={faSun}
        color={theme.primary}
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
