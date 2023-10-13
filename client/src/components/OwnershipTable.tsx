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
    <div className="w-full h-full max-h-full overflow-hidden flex flex-col pt-3 m-0">
      <div className="sticky top-0 w-full text-center font-bold text-xs px-1 pb-2">
        Eierandel / <span className="font-normal">Antall aksjer</span>
      </div>
      <div className="w-full grow overflow-auto">
        <table className="w-full h-full">
          <thead className="sticky z-20 top-0 bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="sticky z-30 left-0 w-20 sm:min-w-[10rem] text-center font-bold text-xs bg-gray-50 dark:bg-gray-800">
                Navn
              </th>
              {getYears(ownerships).map((year) => (
                <th key={year} className="text-left italic text-xs font-normal text-gray-600 dark:text-gray-200">
                  {year}
                </th>
              ))}
              <th></th>
              <th className="sticky right-0"></th>
            </tr>
          </thead>
          <tbody>
            {ownerships.map((o) => (
              <tr key={o._id}>
                <td className="sticky z-10 left-0 w-20 sm:min-w-[10rem] bg-gray-50 dark:bg-gray-800 text-xs text-ellipsis overflow-hidden p-2 m-0">
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
