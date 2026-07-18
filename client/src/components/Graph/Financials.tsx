import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { UserEventType } from "../../models/models";
import { useFinancialsByUnit } from "../../services/brregService";
import { captureUserEventThunk } from "../../slices/userEventSlice";
import { RootState, useAppDispatch } from "../../store";
import { DataSourceNote } from "../DataSourceNote";
import Loading from "../Loading";
import { BalanceSheet } from "./BalanceSheet";
import { ProfitAndLoss } from "./ProfitAndLoss";

export const Financials = () => {
  const dispatch = useAppDispatch();
  const { theme } = useContext(AppContext);

  const { source } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);

  const { financials, isLoading } = useFinancialsByUnit(source?.properties.orgnr);

  useEffect(() => {
    if (source) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.FinancialsLoad,
          uuid: source.properties.uuid,
          orgnr: source.properties.orgnr,
        })
      );
    }
  }, [dispatch, source]);

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
      <DataSourceNote text="Kilde: Regnskapsregisteret (Brønnøysundregistrene)" />
    </div>
  );
};
