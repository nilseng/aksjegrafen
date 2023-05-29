import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { AppContext } from "./AppContext";
import { ApiDocs } from "./components/ApiDocs";
import { GraphContainer } from "./components/Graph/GraphContainer";
import { Landing } from "./components/Landing";
import NavBar from "./components/NavBar";
import { Overlays } from "./components/Overlays";
import { RelationFinder } from "./components/RelationFinder";
import { SearchPage } from "./components/SearchPage";
import { Stats } from "./components/Stats";
import { ICompany, IShareholder } from "./models/models";

import { Graph } from "./components/Graph2/Graph";
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
  const [modalInvestment, setModalInvestment] = useState<ICompany>();
  const [modalInvestor, setModalInvestor] = useState<IShareholder>();
  const [skip, setSkip] = useState<number>(0);

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
    if (theme.id === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        theme,
        tableModalInput: {
          investment: modalInvestment,
          setInvestment: setModalInvestment,
          investor: modalInvestor,
          setInvestor: setModalInvestor,
          limit: 20,
          skip,
          setSkip,
        },
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
            <Route path="/" component={Landing} exact />
            <Route path="/graph" component={GraphContainer} />
            <Route path="/search" component={SearchPage} />
            <Route path="/stats" component={Stats} />
            <Route path="/relation-finder" component={RelationFinder} />
            <Route path="/api-docs" component={ApiDocs} />
            <Route path="/graph2" component={Graph} />
          </Switch>
        </div>
        <Overlays />
      </Router>
    </AppContext.Provider>
  );
};

export default App;
