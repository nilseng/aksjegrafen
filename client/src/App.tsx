import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Company } from "./components/Company";
import CytoGraph from "./components/Graph/CytoGraph";
import { D3Graph } from "./components/Graph/D3Graph";
import { ReactD3Graph } from "./components/Graph/ReactD3Graph";
import { Landing } from "./components/Landing";
import { Shareholder } from "./components/Shareholder";

import history from "./utils/history";

const App = () => {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" component={Landing} exact />
        <Route path="/shareholder" component={Shareholder} />
        <Route path="/company" component={Company} />
        <Route path="/graph" component={CytoGraph} />
        <Route path="/react-d3-graph" component={ReactD3Graph} />
        <Route path="/d3-graph" component={D3Graph} />
      </Switch>
    </Router>
  );
};

export default App;
