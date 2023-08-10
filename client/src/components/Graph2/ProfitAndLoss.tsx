import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { IFinancials } from "../../services/brregService";

export const ProfitAndLoss = ({ pAndL }: { pAndL: IFinancials["resultatregnskapResultat"] }) => {
  const { theme } = useContext(AppContext);

  return (
    <div className="w-full sm:w-1/2">
      <p className="font-bold my-1">Resultat</p>
      {(pAndL?.driftsresultat?.driftsinntekter?.sumDriftsinntekter ||
        pAndL?.driftsresultat?.driftsinntekter?.sumDriftsinntekter === 0) && (
        <>
          <p className="text-xs font-bold m-0">Driftsinntekter</p>
          <code style={{ color: theme.primary }} className="text-xs m-0">
            {pAndL?.driftsresultat?.driftsinntekter?.sumDriftsinntekter?.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {pAndL?.driftsresultat?.driftsresultat || pAndL?.driftsresultat?.driftsresultat === 0 ? (
        <>
          <p className="text-xs font-bold m-0">Driftsresultat</p>
          <code
            style={{
              color: pAndL?.driftsresultat?.driftsresultat > 0 ? theme.primary : theme.danger,
            }}
            className="text-xs m-0"
          >
            {pAndL?.driftsresultat?.driftsresultat?.toLocaleString(navigator?.language)}
          </code>
        </>
      ) : null}
      {(pAndL?.totalresultat || pAndL?.totalresultat === 0) && (
        <>
          <p className="text-xs font-bold m-0">Totalresultat</p>
          <code
            className="text-xs mb-0"
            style={{
              color: pAndL?.totalresultat > 0 ? theme.primary : theme.danger,
            }}
          >
            {pAndL?.totalresultat?.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {pAndL?.aarsresultat || pAndL?.aarsresultat === 0 ? (
        <>
          <p className="text-xs font-bold m-0">Årsresultat</p>
          <code
            className="text-xs mb-0"
            style={{
              color: pAndL?.aarsresultat > 0 ? theme.primary : theme.danger,
            }}
          >
            {pAndL?.aarsresultat?.toLocaleString(navigator?.language)}
          </code>
        </>
      ) : null}
    </div>
  );
};
