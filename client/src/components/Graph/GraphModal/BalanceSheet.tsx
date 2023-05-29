import { useContext } from "react";
import { AppContext } from "../../../AppContext";
import { IFinancials } from "../../../services/brregService";

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
      <p className="text-xs font-bold m-0">Egenkapital</p>
      <code
        className="text-xs mb-0"
        style={{
          color: theme.primary,
        }}
      >
        {equityAndDebt.egenkapital.sumEgenkapital?.toLocaleString(navigator?.language)}
      </code>
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
