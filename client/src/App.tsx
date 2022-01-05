import React, { useState } from "react";
import { useEffect } from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { CytoGraph } from "./components/CytoGraph";
import { GraphContainer } from "./components/Graph/GraphContainer";
import { Landing } from "./components/Landing";
import NavBar from "./components/NavBar";
import { Stats } from "./components/Stats";

import { theming } from "./theming/theme";

export enum Theme {
  light = "light",
  dark = "dark",
}

export const AppContext = React.createContext({
  theme: theming[Theme.light],
});

const App = () => {
  const [theme, setTheme] = useState(theming[Theme.light]);

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
  }, [theme]);

  useEffect(() => {
    const t = localStorage.getItem("theme");
    if (t) setTheme(theming[t as Theme]);
  }, []);

  return (
    <Router>
      <NavBar theme={theme} setTheme={setTheme} />
      <div
        className="d-flex w-100 justify-content-center align-items-middle"
        style={{
          minHeight: "calc(100vh - 77.19px)",
          height: "calc(100vh - 77.19px)",
        }}
      >
        <Switch>
          <AppContext.Provider value={{ theme }}>
            <Route path="/" component={Landing} exact />
            <Route path="/graph" component={GraphContainer} />
            <Route path="/stats" component={Stats} />
            <Route path="/cyto-graph" component={CytoGraph} />
          </AppContext.Provider>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
