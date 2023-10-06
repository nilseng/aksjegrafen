import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { IFinancials } from "../../services/brregService";

export const BalanceSheet = ({
  assets,
  equityAndDebt,
}: {
  assets: IFinancials["eiendeler"];
  equityAndDebt: IFinancials["egenkapitalGjeld"];
}) => {
  const { theme } = useContext(AppContext);

  return (
    <div className="w-full sm:w-1/2">
      <p className="font-bold my-1">Eiendeler</p>
      <p className="text-xs font-bold m-0">Anleggsmidler</p>
      <code
        className="text-xs mb-0"
        style={{
          color: theme.primary,
        }}
      >
        {assets.anleggsmidler?.sumAnleggsmidler?.toLocaleString(navigator?.language)}
      </code>
      <p className="text-xs font-bold m-0">Omløpsmidler</p>
      <code
        className="text-xs mb-0"
        style={{
          color: theme.primary,
        }}
      >
        {assets.omloepsmidler?.sumOmloepsmidler?.toLocaleString(navigator?.language)}
      </code>
      <p className="text-xs font-bold m-0">Sum eiendeler</p>
      <code
        className="text-xs mb-0"
        style={{
          color: theme.primary,
        }}
      >
        {assets.sumEiendeler?.toLocaleString(navigator?.language)}
      </code>
      <p className="font-bold my-1">Egenkapital og gjeld</p>
      {(equityAndDebt?.egenkapital.innskuttEgenkapital.sumInnskuttEgenkaptial ||
        equityAndDebt?.egenkapital.innskuttEgenkapital.sumInnskuttEgenkaptial === 0) && (
        <>
          <p className="text-xs font-bold m-0">Innskutt egenkapital</p>
          <code style={{ color: theme.primary }} className="text-xs m-0">
            {equityAndDebt?.egenkapital.innskuttEgenkapital.sumInnskuttEgenkaptial.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {(equityAndDebt?.egenkapital.opptjentEgenkapital.sumOpptjentEgenkapital ||
        equityAndDebt?.egenkapital.opptjentEgenkapital.sumOpptjentEgenkapital === 0) && (
        <>
          <p className="text-xs font-bold m-0">Opptjent egenkapital</p>
          <code
            style={{
              color:
                equityAndDebt?.egenkapital.opptjentEgenkapital.sumOpptjentEgenkapital > 0
                  ? theme.primary
                  : theme.danger,
            }}
            className="text-xs m-0"
          >
            {equityAndDebt?.egenkapital.opptjentEgenkapital.sumOpptjentEgenkapital.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      <div className="pb-2">
        <p className="text-xs font-bold m-0">Egenkapital</p>
        <code
          className="text-xs mb-0"
          style={{
            color: theme.primary,
          }}
        >
          {equityAndDebt.egenkapital.sumEgenkapital?.toLocaleString(navigator?.language)}
        </code>
      </div>
      {(equityAndDebt?.gjeldOversikt.kortsiktigGjeld.sumKortsiktigGjeld ||
        equityAndDebt?.gjeldOversikt.kortsiktigGjeld.sumKortsiktigGjeld === 0) && (
        <>
          <p className="text-xs font-bold m-0">Kortsiktig gjeld</p>
          <code style={{ color: theme.primary }} className="text-xs m-0">
            {equityAndDebt?.gjeldOversikt.kortsiktigGjeld.sumKortsiktigGjeld.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      {(equityAndDebt?.gjeldOversikt.langsiktigGjeld.sumLangsiktigGjeld ||
        equityAndDebt?.gjeldOversikt.langsiktigGjeld.sumLangsiktigGjeld === 0) && (
        <>
          <p className="text-xs font-bold m-0">Langsiktig gjeld</p>
          <code style={{ color: theme.primary }} className="text-xs m-0">
            {equityAndDebt?.gjeldOversikt.langsiktigGjeld.sumLangsiktigGjeld.toLocaleString(navigator?.language)}
          </code>
        </>
      )}
      <p className="text-xs font-bold m-0">Gjeld</p>
      <code
        className="text-xs mb-0"
        style={{
          color: theme.primary,
        }}
      >
        {equityAndDebt.gjeldOversikt.sumGjeld?.toLocaleString(navigator?.language)}
      </code>
      <p className="text-xs font-bold m-0">Sum egenkapital og gjeld</p>
      <code
        className="text-xs mb-0"
        style={{
          color: theme.primary,
        }}
      >
        {equityAndDebt.sumEgenkapitalGjeld?.toLocaleString(navigator?.language)}
      </code>
    </div>
  );
};
