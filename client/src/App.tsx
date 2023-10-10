import { useEffect, useState } from "react";
import { Redirect, Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { AppContext } from "./AppContext";
import { ApiDocs } from "./components/ApiDocs";
import NavBar from "./components/NavBar";
import { Overlays } from "./components/Overlays";

import { Graph } from "./components/Graph/Graph";
import { Theme, theming } from "./theming/theme";

const getStoredTheme = () => {
  const t = localStorage.getItem("theme");
  if (t) return theming[t as Theme];
};

const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? theming["dark"] : theming["light"];
};

const App = () => {
  const [theme, setTheme] = useState(getStoredTheme() ?? getSystemTheme() ?? theming[Theme.light]);

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
    if (theme.id === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        theme,
      }}
    >
      <Router>
        <NavBar theme={theme} setTheme={setTheme} />
        <div
          id="ag-main"
          className="flex w-full justify-center"
          style={{
            minHeight: "calc(100% - 83.2px)",
            height: "calc(100% - 83.2px)",
          }}
        >
          <Switch>
            <Route path="/api-docs" component={ApiDocs} />
            <Route path="/" component={Graph} exact />
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </div>
        <Overlays />
      </Router>
    </AppContext.Provider>
  );
};

export default App;
