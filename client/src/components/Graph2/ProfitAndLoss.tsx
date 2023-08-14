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
      {(pAndL?.driftsresultat?.driftskostnad?.sumDriftskostnad ||
        pAndL?.driftsresultat?.driftskostnad?.sumDriftskostnad === 0) && (
        <>
          <p className="text-xs font-bold m-0">Driftskostnad</p>
          <code style={{ color: theme.danger }} className="text-xs m-0">
            {pAndL.driftsresultat.driftskostnad.sumDriftskostnad.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {pAndL?.driftsresultat?.driftsresultat || pAndL?.driftsresultat?.driftsresultat === 0 ? (
        <div className="pb-2">
          <p className="text-xs font-bold m-0">Driftsresultat</p>
          <code
            style={{
              color: pAndL?.driftsresultat?.driftsresultat > 0 ? theme.primary : theme.danger,
            }}
            className="text-xs m-0"
          >
            {pAndL?.driftsresultat?.driftsresultat?.toLocaleString(navigator?.language)}
          </code>
        </div>
      ) : null}
      {(pAndL?.finansresultat?.finansinntekt?.sumFinansinntekter ||
        pAndL?.finansresultat?.finansinntekt?.sumFinansinntekter === 0) && (
        <>
          <p className="text-xs font-bold m-0">Finansinntekter</p>
          <code style={{ color: theme.primary }} className="text-xs m-0">
            {pAndL?.finansresultat?.finansinntekt?.sumFinansinntekter?.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {(pAndL?.finansresultat?.finanskostnad?.sumFinanskostnad ||
        pAndL?.finansresultat?.finanskostnad?.sumFinanskostnad === 0) && (
        <>
          <p className="text-xs font-bold m-0">Finanskostnad</p>
          <code style={{ color: theme.danger }} className="text-xs m-0">
            {pAndL?.finansresultat?.finanskostnad?.sumFinanskostnad?.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {(pAndL?.finansresultat?.nettoFinans || pAndL?.finansresultat?.nettoFinans === 0) && (
        <div className="pb-2">
          <p className="text-xs font-bold m-0">Finansresultat</p>
          <code
            style={{ color: pAndL?.finansresultat?.nettoFinans >= 0 ? theme.primary : theme.danger }}
            className="text-xs m-0"
          >
            {pAndL?.finansresultat?.nettoFinans?.toLocaleString(navigator?.language)}
          </code>
        </div>
      )}
      {(pAndL?.ordinaertResultatFoerSkattekostnad || pAndL?.ordinaertResultatFoerSkattekostnad === 0) && (
        <>
          <p className="text-xs font-bold m-0">Resultat før skatt</p>
          <code
            className="text-xs mb-0"
            style={{
              color: pAndL?.ordinaertResultatFoerSkattekostnad > 0 ? theme.primary : theme.danger,
            }}
          >
            {pAndL?.ordinaertResultatFoerSkattekostnad?.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
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
