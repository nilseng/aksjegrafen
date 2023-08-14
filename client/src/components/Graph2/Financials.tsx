import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { useFinancialsByUnit } from "../../services/brregService";
import { RootState } from "../../store";
import Loading from "../Loading";
import { BalanceSheet } from "./BalanceSheet";
import { ProfitAndLoss } from "./ProfitAndLoss";

export const Financials = () => {
  const { theme } = useContext(AppContext);

  const source = useSelector<RootState, RootState["graph"]["data"]["source"]>((state) => state.graph.data.source);

  const { financials, isLoading } = useFinancialsByUnit(source?.properties.orgnr);

  if (isLoading) return <Loading color={theme.primary} backgroundColor="transparent" />;

  if (!financials || (financials as any).error)
    return <p className="text-center">Fant ikke regnskapstall for {source?.properties.name} 😢</p>;

  return (
    <div className="flex flex-col w-full h-full max-h-full pt-12">
      <p style={{ color: theme.primary }} className="text-center font-semibold pb-2">
        Regnskap for {source?.properties.name}
      </p>
      {financials?.map((f) => (
        <div
          key={f.id}
          style={{ border: `${theme.primary} solid 1px` }}
          className="w-full grow overflow-scroll rounded p-4"
        >
          <div className="flex justify-between flex-wrap">
            <ProfitAndLoss pAndL={f.resultatregnskapResultat} />
            <BalanceSheet assets={f.eiendeler} equityAndDebt={f.egenkapitalGjeld} />
          </div>
          <div className="text-center">
            <p style={{ color: theme.text }} className="text-xs pt-2 m-0">
              Periode: {new Date(f.regnskapsperiode?.fraDato).toLocaleDateString(navigator?.language)}-
              {new Date(f.regnskapsperiode.tilDato).toLocaleDateString(navigator?.language)}
            </p>
            <p style={{ color: theme.text }} className="text-xs m-0">
              Valuta: {f.valuta}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
