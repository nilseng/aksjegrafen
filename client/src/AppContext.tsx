import { createContext, Dispatch, SetStateAction } from "react";
import { ICompany, IShareholder } from "./models/models";
import { Theme, theming } from "./theming/theme";

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

export const AppContext = createContext<IAppContext>({
  theme: theming[Theme.light],
  tableModalInput: { setInvestment: () => {}, setInvestor: () => {}, limit: 10, skip: 0, setSkip: () => {} },
});
