import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AppContext } from "./AppContext";
import { CytoGraph } from "./components/CytoGraph";
import { GraphContainer } from "./components/Graph/GraphContainer";
import { Landing } from "./components/Landing";
import NavBar from "./components/NavBar";
import { Overlays } from "./components/Overlays";
import { SearchPage } from "./components/SearchPage";
import { Stats } from "./components/Stats";
import { ICompany, IShareholder } from "./models/models";

import { Theme, theming } from "./theming/theme";

const getStoredTheme = () => {
  const t = localStorage.getItem("theme");
  if (t) return theming[t as Theme];
};

const App = () => {
  const [theme, setTheme] = useState(getStoredTheme() ?? theming[Theme.light]);
  const [modalInvestment, setModalInvestment] = useState<ICompany>();
  const [modalInvestor, setModalInvestor] = useState<IShareholder>();
  const [skip, setSkip] = useState<number>(0);

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
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
          </Switch>
        </div>
        <Overlays />
      </Router>
    </AppContext.Provider>
  );
};

export default App;
