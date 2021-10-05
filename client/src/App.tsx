import React, { useState } from "react";
import { useEffect } from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Company } from "./components/Company";
import { CytoGraph } from "./components/CytoGraph";
import { Graph } from "./components/Graph/Graph";
import { Landing } from "./components/Landing";
import NavBar from "./components/NavBar";
import { OwnershipChart } from "./components/OwnershipChart/OwnershipChart";
import { Shareholder } from "./components/Shareholder";
import { Stats } from "./components/Stats";

import { theming } from "./theming/theme";

import history from "./utils/history";

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
    <Router history={history}>
      <NavBar theme={theme} setTheme={setTheme} />
      <div
        className="d-flex w-100"
        style={{
          minHeight: "calc(100vh - 72.19px)",
          height: "calc(100vh - 72.19px)",
        }}
      >
        <Switch>
          <AppContext.Provider value={{ theme }}>
            <Route path="/" component={Landing} exact />
            <Route path="/graph" component={Graph} />
            <Route path="/shareholder" component={Shareholder} />
            <Route path="/company" component={Company} />
            <Route path="/ownership-chart" component={OwnershipChart} />
            <Route path="/stats" component={Stats} />
            <Route path="/cyto-graph" component={CytoGraph} />
          </AppContext.Provider>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
