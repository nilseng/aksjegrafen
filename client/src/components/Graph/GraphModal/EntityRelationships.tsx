import { useContext } from "react";
import { AppContext } from "../../../App";
import { ICompany, IShareholder } from "../../../models/models";

interface IProps {
  entity: ICompany | IShareholder;
}

export const EntityRelationships = ({ entity }: IProps) => {
  const { theme } = useContext(AppContext);

  return (
    <div className="row w-100 p-2 m-0">
      {entity.investmentCount && (
        <div className="col rounded p-4 m-2" style={{ border: `${theme.primary} solid 1px` }}>
          <p className="font-weight-bold" style={{ color: theme.primary }}>
            Investeringer
          </p>
          {entity.investmentCount[2021] && <p className="small pl-2">2021: {entity.investmentCount[2021]}</p>}
          {entity.investmentCount[2020] && <p className="small pl-2">2020: {entity.investmentCount[2020]}</p>}
          {entity.investmentCount[2019] && <p className="small pl-2">2019: {entity.investmentCount[2019]}</p>}
        </div>
      )}
      {entity.investorCount && (
        <div className="col rounded p-4 m-2" style={{ border: `${theme.primary} solid 1px` }}>
          <p className="font-weight-bold" style={{ color: theme.secondary }}>
            Investorer
          </p>
          {entity.investorCount[2021] && <p className="small pl-2">2021: {entity.investorCount[2021]}</p>}
          {entity.investorCount[2020] && <p className="small pl-2">2020: {entity.investorCount[2020]}</p>}
          {entity.investorCount[2019] && <p className="small pl-2">2019: {entity.investorCount[2019]}</p>}
        </div>
      )}
    </div>
  );
};
