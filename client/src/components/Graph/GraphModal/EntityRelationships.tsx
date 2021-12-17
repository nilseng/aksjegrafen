import { ICompany, IShareholder } from "../../../models/models";

interface IProps {
  entity: ICompany | IShareholder;
}

export const EntityRelationships = ({ entity }: IProps) => {
  return (
    <div className="row w-100">
      {entity.investmentCount && (
        <div className="col">
          <p className="font-weight-bold">Investeringer</p>
          {entity.investmentCount[2020] && <p className="small pl-2">2020: {entity.investmentCount[2020]}</p>}
          {entity.investmentCount[2019] && <p className="small pl-2">2019: {entity.investmentCount[2019]}</p>}
        </div>
      )}
      {entity.investorCount && (
        <div className="col">
          <p className="font-weight-bold">Investorer</p>
          {entity.investorCount[2020] && <p className="small pl-2">2020: {entity.investorCount[2020]}</p>}
          {entity.investorCount[2019] && <p className="small pl-2">2019: {entity.investorCount[2019]}</p>}
        </div>
      )}
    </div>
  );
};
