import { useContext } from "react";
import { AppContext } from "../../../AppContext";
import { availableYears } from "../../../config";
import { ICompany, IShareholder } from "../../../models/models";

interface IProps {
  entity: ICompany | IShareholder;
}

export const EntityRelationships = ({ entity }: IProps) => {
  const { theme } = useContext(AppContext);

  return (
    <div className="flex w-full p-2 m-0">
      {entity.investmentCount && (
        <div className="w-full md:w-1/2 rounded p-4 m-2" style={{ border: `${theme.primary} solid 1px` }}>
          <p className="text-sm font-bold" style={{ color: theme.primary }}>
            Investeringer
          </p>
          {availableYears.map(
            (year) =>
              entity.investmentCount?.[year] && (
                <p key={year} className="text-xs p-2">
                  {year}: {entity.investmentCount[year]?.toLocaleString("NO")}
                </p>
              )
          )}
        </div>
      )}
      {entity.investorCount && (
        <div className="w-full md:w-1/2 rounded p-4 m-2" style={{ border: `${theme.primary} solid 1px` }}>
          <p className="font-bold" style={{ color: theme.secondary }}>
            Investorer
          </p>
          {availableYears.map(
            (year) =>
              entity.investorCount?.[year] && (
                <p key={year} className="text-xs p-2">
                  {year}: {entity.investorCount[year]?.toLocaleString("NO")}
                </p>
              )
          )}
        </div>
      )}
    </div>
  );
};
