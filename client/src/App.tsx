import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Company } from "./components/Company";
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
      </Switch>
    </Router>
  );
};

export default App;
