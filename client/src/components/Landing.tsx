import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { About } from "./About";
import { Disclaimer } from "./Disclaimer";
import { Heading } from "./Heading";
import { SearchView } from "./SearchView";

export const Landing = () => {
  useDocumentTitle("Aksjegrafen");
  return (
    <div className="w-100">
      <div className="d-flex flex-column justify-content-center" style={{ minHeight: "100%" }}>
        <SearchView />
        <Heading />
      </div>
      <About />
      <Disclaimer />
    </div>
  );
};
