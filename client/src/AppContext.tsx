import { createContext } from "react";
import { Theme, theming } from "./theming/theme";

interface IAppContext {
  theme: typeof theming.light;
}

export const AppContext = createContext<IAppContext>({
  theme: theming[Theme.light],
});
