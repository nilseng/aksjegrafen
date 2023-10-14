import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import "./index.scss";
import reportWebVitals from "./reportWebVitals";
import { store } from "./store";

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://36f44f30602378a8f7c39efc41d114f5@o4506050474082304.ingest.sentry.io/4506050475720704",
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
