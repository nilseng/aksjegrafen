import { faMoon } from "@fortawesome/free-regular-svg-icons";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { theming } from "../theming/theme";

interface IProps {
  theme: typeof theming.light;
}

export const ThemeIcon = ({ theme }: IProps) => (
  <FontAwesomeIcon icon={theme.id === "light" ? faSun : faMoon} color={theme.primary} />
);
