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

  if (!financials) return null;

  return (
    <div className="p-4 mb-4" style={{ ...theme.lowering }}>
      {financials?.length > 0 && (
        <>
          <p style={{ color: theme.muted }}>{new Date(financials[0].regnskapsperiode?.fraDato).getFullYear()}</p>
          <p className="font-weight-bold mb-1">Driftsinntekter</p>
          <p style={{ color: theme.primary }}>
            {financials[0].resultatregnskapResultat?.driftsresultat?.driftsinntekter?.sumDriftsinntekter?.toLocaleString(
              navigator?.language
            )}
          </p>
          <p className="font-weight-bold mb-1">Driftsresultat</p>
          <p
            style={{
              color:
                financials[0].resultatregnskapResultat?.driftsresultat?.driftsresultat > 0
                  ? theme.primary
                  : theme.danger,
            }}
          >
            {financials[0].resultatregnskapResultat?.driftsresultat?.driftsresultat?.toLocaleString(
              navigator?.language
            )}
          </p>
          {financials[0].resultatregnskapResultat?.totalresultat && (
            <>
              <p className="font-weight-bold mb-1">Totalresultat</p>
              <p
                className="mb-0"
                style={{
                  color: financials[0].resultatregnskapResultat?.totalresultat > 0 ? theme.primary : theme.danger,
                }}
              >
                {financials[0].resultatregnskapResultat?.totalresultat?.toLocaleString(navigator?.language)}
              </p>
            </>
          )}
          {financials[0].resultatregnskapResultat?.aarsresultat && (
            <>
              <p className="font-weight-bold mb-1">Årsresultat</p>
              <p
                className="mb-0"
                style={{
                  color: financials[0].resultatregnskapResultat?.aarsresultat > 0 ? theme.primary : theme.danger,
                }}
              >
                {financials[0].resultatregnskapResultat?.aarsresultat?.toLocaleString(navigator?.language)}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};
