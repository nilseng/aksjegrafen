import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CytoGraph } from "./components/CytoGraph";
import { EntityMap } from "./components/EntityMap";
import { GraphContainer } from "./components/Graph/GraphContainer";
import { Landing } from "./components/Landing";
import NavBar from "./components/NavBar";
import { Overlays } from "./components/Overlays";
import { SearchPage } from "./components/SearchPage";
import { Stats } from "./components/Stats";
import { ICompany, IShareholder } from "./models/models";

import { theming } from "./theming/theme";

export enum Theme {
  light = "light",
  dark = "dark",
}

interface IAppContext {
  theme: typeof theming.light;
  tableModalInput: {
    investment?: ICompany;
    setInvestment: Dispatch<SetStateAction<ICompany | undefined>>;
    investor?: IShareholder;
    setInvestor: Dispatch<SetStateAction<IShareholder | undefined>>;
    limit: number;
    skip: number;
    setSkip: Dispatch<SetStateAction<number>>;
  };
}

export const AppContext = React.createContext<IAppContext>({
  theme: theming[Theme.light],
  tableModalInput: { setInvestment: () => {}, setInvestor: () => {}, limit: 10, skip: 0, setSkip: () => {} },
});

const App = () => {
  const [theme, setTheme] = useState(theming[Theme.light]);
  const [modalInvestment, setModalInvestment] = useState<ICompany>();
  const [modalInvestor, setModalInvestor] = useState<IShareholder>();
  const [skip, setSkip] = useState<number>(0);

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
  }, [theme]);

  useEffect(() => {
    const t = localStorage.getItem("theme");
    if (t) setTheme(theming[t as Theme]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        tableModalInput: {
          investment: modalInvestment,
          setInvestment: setModalInvestment,
          investor: modalInvestor,
          setInvestor: setModalInvestor,
          limit: 50,
          skip,
          setSkip,
        },
      }}
    >
      <Router>
        <NavBar theme={theme} setTheme={setTheme} />
        <div
          id="ag-main"
          className="d-flex w-100 justify-content-center align-items-middle"
          style={{
            minHeight: "calc(100% - 83.2px)",
            height: "calc(100% - 83.2px)",
          }}
        >
          <Switch>
            <Route path="/" component={Landing} exact />
            <Route path="/graph" component={GraphContainer} />
            <Route path="/search" component={SearchPage} />
            <Route path="/stats" component={Stats} />
            <Route path="/cyto-graph" component={CytoGraph} />
            <Route path="/entity-map" component={EntityMap} />
          </Switch>
        </div>
        <Overlays />
      </Router>
    </AppContext.Provider>
  );
};

export default App;
