import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import { CytoGraph } from "./components/CytoGraph";
import { EntityMap } from "./components/EntityMap";
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
        id="ag-main"
        className="d-flex w-100 justify-content-center align-items-middle"
        style={{
          minHeight: "calc(100% - 77.188px)",
          height: "calc(100% - 77.188px)",
        }}
      >
        <Switch>
          <AppContext.Provider value={{ theme }}>
            <Route path="/" component={Landing} exact />
            <Route path="/graph" component={GraphContainer} />
            <Route path="/stats" component={Stats} />
            <Route path="/cyto-graph" component={CytoGraph} />
            <Route path="/entity-map" component={EntityMap} />
          </AppContext.Provider>
        </Switch>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        transition={Slide}
        hideProgressBar={true}
        theme={theme.id === "dark" ? "dark" : "light"}
      />
    </Router>
  );
};

export default App;
