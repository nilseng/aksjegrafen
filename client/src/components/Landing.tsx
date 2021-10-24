import { About } from "./About";
import { SearchView } from "./SearchView";

export const Landing = () => {
  return (
    <div>
      <div
        className="d-flex w-100 justify-content-center align-items-middle"
        style={{ minHeight: "100%" }}
      >
        <SearchView />
      </div>
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <About />
      </div>
    </div>
  );
};
