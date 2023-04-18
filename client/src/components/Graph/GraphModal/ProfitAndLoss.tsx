import { useContext } from "react";
import { AppContext } from "../../../AppContext";
import { IFinancials } from "../../../services/brregService";

export const ProfitAndLoss = ({ pAndL }: { pAndL: IFinancials["resultatregnskapResultat"] }) => {
  const { theme } = useContext(AppContext);

  return (
    <>
      <p className="font-weight-bold my-1">Resultat</p>
      <p className="small font-weight-bold m-0">Driftsinntekter</p>
      <code style={{ color: theme.primary }} className="m-0">
        {pAndL?.driftsresultat?.driftsinntekter?.sumDriftsinntekter?.toLocaleString(navigator?.language)}
      </code>
      <p className="small font-weight-bold m-0">Driftsresultat</p>
      <code
        style={{
          color: pAndL?.driftsresultat?.driftsresultat > 0 ? theme.primary : theme.danger,
        }}
        className="m-0"
      >
        {pAndL?.driftsresultat?.driftsresultat?.toLocaleString(navigator?.language)}
      </code>
      {pAndL?.totalresultat && (
        <>
          <p className="small font-weight-bold m-0">Totalresultat</p>
          <code
            className="mb-0"
            style={{
              color: pAndL?.totalresultat > 0 ? theme.primary : theme.danger,
            }}
          >
            {pAndL?.totalresultat?.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {pAndL?.aarsresultat && (
        <>
          <p className="small font-weight-bold m-0">Årsresultat</p>
          <code
            className="mb-0"
            style={{
              color: pAndL?.aarsresultat > 0 ? theme.primary : theme.danger,
            }}
          >
            {pAndL?.aarsresultat?.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
    </>
  );
};
