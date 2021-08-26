import React, { useState } from "react";
import { useEffect } from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Company } from "./components/Company";
import { Landing } from "./components/Landing";
import NavBar from "./components/NavBar";
import { OwnershipChart } from "./components/OwnershipChart/OwnershipChart";
import { Shareholder } from "./components/Shareholder";

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
      <Switch>
        <AppContext.Provider value={{ theme }}>
          <Route path="/" component={Landing} exact />
          <Route path="/shareholder" component={Shareholder} />
          <Route path="/company" component={Company} />
          <Route path="/ownership-chart" component={OwnershipChart} />
        </AppContext.Provider>
      </Switch>
    </Router>
  );
};

export default App;
