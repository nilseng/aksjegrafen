import { useContext } from "react";
import { AppContext } from "../../../AppContext";
import { ICompany, IShareholder } from "../../../models/models";
import { useFinancialsByUnit } from "../../../services/brregService";
import { BalanceSheet } from "./BalanceSheet";
import { ProfitAndLoss } from "./ProfitAndLoss";

interface IProps {
  entity: ICompany | IShareholder;
}

export const Financials = ({ entity }: IProps) => {
  const { theme } = useContext(AppContext);

  const financials = useFinancialsByUnit(entity);

  if (!financials || (financials as any).error) return null;

  return (
    <div className="mb-4">
      <p style={{ color: theme.primary }} className="font-semibold pb-2">
        Finansielle nøkkeltall fra forrige regnskapsår
      </p>
      {financials?.map((f) => (
        <div key={f.id} style={{ border: `${theme.primary} solid 1px` }} className="rounded p-4">
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
