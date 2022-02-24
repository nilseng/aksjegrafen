import { useContext } from "react";
import { AppContext } from "../../../App";
import { ICompany, IShareholder } from "../../../models/models";
import { useFinancialsByUnit } from "../../../services/brregService";

interface IProps {
  entity: ICompany | IShareholder;
}

export const Financials = ({ entity }: IProps) => {
  const { theme } = useContext(AppContext);

  const financials = useFinancialsByUnit(entity);

  if (!financials || (financials as any).error) return null;

  return (
    <div className="p-4 mb-4" style={{ ...theme.lowering }}>
      {financials?.map((f) => (
        <div key={f.id}>
          <p style={{ color: theme.muted }}>{new Date(f.regnskapsperiode?.fraDato).getFullYear()}</p>
          <p className="font-weight-bold mb-1">Driftsinntekter</p>
          <p style={{ color: theme.primary }}>
            {f.resultatregnskapResultat?.driftsresultat?.driftsinntekter?.sumDriftsinntekter?.toLocaleString(
              navigator?.language
            )}
          </p>
          <p className="font-weight-bold mb-1">Driftsresultat</p>
          <p
            style={{
              color: f.resultatregnskapResultat?.driftsresultat?.driftsresultat > 0 ? theme.primary : theme.danger,
            }}
          >
            {f.resultatregnskapResultat?.driftsresultat?.driftsresultat?.toLocaleString(navigator?.language)}
          </p>
          {f.resultatregnskapResultat?.totalresultat && (
            <>
              <p className="font-weight-bold mb-1">Totalresultat</p>
              <p
                className="mb-0"
                style={{
                  color: f.resultatregnskapResultat?.totalresultat > 0 ? theme.primary : theme.danger,
                }}
              >
                {f.resultatregnskapResultat?.totalresultat?.toLocaleString(navigator?.language)}
              </p>
            </>
          )}
          {f.resultatregnskapResultat?.aarsresultat && (
            <>
              <p className="font-weight-bold mb-1">Årsresultat</p>
              <p
                className="mb-0"
                style={{
                  color: f.resultatregnskapResultat?.aarsresultat > 0 ? theme.primary : theme.danger,
                }}
              >
                {f.resultatregnskapResultat?.aarsresultat?.toLocaleString(navigator?.language)}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
