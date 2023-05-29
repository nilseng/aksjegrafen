import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Disclaimer } from "./Disclaimer";
import { Heading } from "./Heading";
import { SearchView } from "./SearchView";

export const Landing = () => {
  useDocumentTitle("Aksjegrafen");
  return (
    <div className="w-full">
      <div className="flex flex-col justify-center items-center min-h-full">
        <SearchView />
        <Heading />
      </div>
      <Disclaimer />
    </div>
  );
};
