import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const containerEl = document.getElementById("ag-main");
  expect(containerEl).toBeInTheDocument();
});
