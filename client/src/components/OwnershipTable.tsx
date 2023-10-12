import { ICompany, IOwnership, IShareholder } from "../models/models";
import { getYears } from "../utils/getYears";
import { OwnershipDetail } from "./OwnershipDetail";

export const OwnershipTable = ({
  ownerships,
  investor,
  investment,
  closeModal,
  getGraphLink,
}: {
  ownerships: IOwnership[];
  investor?: IShareholder;
  investment?: ICompany;
  closeModal: () => void;
  getGraphLink?: (o: IOwnership) => string | Promise<string>;
}) => {
  return (
    <div className="w-full h-full flex flex-wrap pt-3 m-0">
      <p className="w-40"></p>
      <p className="grow text-center font-bold text-xs px-1 pb-2">
        Eierandel / <span className="font-normal">Antall aksjer</span>
      </p>
      <div className="w-full h-full overflow-auto">
        <table className="w-full">
          <thead className="sticky z-20 top-0 bg-gray-50 dark:bg-gray-800">
            <th className="sticky z-30 left-0 w-40 text-center font-bold text-xs bg-gray-50 dark:bg-gray-800">Navn</th>
            {getYears(ownerships).map((year) => (
              <th className="text-left italic text-xs font-normal">{year}</th>
            ))}
            <th></th>
            <th className="sticky right-0"></th>
          </thead>
          <tbody>
            {ownerships.map((o) => (
              <tr>
                <td className="sticky z-10 left-0 w-40 sm:min-w-[10rem] bg-gray-50 dark:bg-gray-800 text-xs text-ellipsis overflow-hidden p-2 m-0">
                  {investment ? o.investor?.shareholder?.name : o.investment?.name}
                </td>
                <OwnershipDetail
                  ownership={o}
                  investment={investment}
                  investor={investor}
                  availableYears={getYears(ownerships)}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
