import { Fragment, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../AppContext";
import { ICompany, IOwnership, IShareholder } from "../models/models";
import { getYears } from "../utils/getYears";
import { GraphLogo } from "./GraphLogo";
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
  const { theme } = useContext(AppContext);
  const history = useHistory();
  return (
    <div className="w-full flex flex-wrap pt-3 m-0">
      <p className="w-3/12"></p>
      <p className="w-8/12 text-center font-bold text-xs px-1 pb-2">
        Eierandel / <span className="font-normal">Antall aksjer</span>
      </p>
      <div className="flex w-full">
        <p className="w-3/12 text-center font-bold text-xs px-1 sm:pl-3 mb-1">Navn</p>
        <div className="flex overflow-auto">
          {getYears(ownerships).map((year) => (
            <p key={year} className="w-20 min-w-[5rem] text-xs font-bold px-1 mb-1 sm:mb-2">
              {year}
            </p>
          ))}
        </div>
      </div>
      <div className="w-full px-1 px-sm-3 pb-1 pb-sm-3">
        <div className="w-full" style={{ borderBottom: `0.5px solid ${theme.secondary}` }}></div>
      </div>
      {ownerships.map((o) => (
        <Fragment key={o._id}>
          <div className="flex w-full overflow-hidden">
            <span className="flex justify-between items-center w-3/12 overflow-auto px-1 sm:pl-4">
              <p className="text-xs text-ellipsis overflow-hidden m-0">
                {investment ? o.investor?.shareholder?.name : o.investment?.name}
              </p>
              {getGraphLink ? (
                <span
                  className="flex justify-center items-center ml-2 mr-sm-4"
                  style={{
                    ...theme.button,
                    cursor: "pointer",
                    borderRadius: "100%",
                    width: "1.6rem",
                    minWidth: "1.6rem",
                    height: "1.6rem",
                    minHeight: "1.6rem",
                  }}
                  onClick={async () => {
                    closeModal();
                    const link = await getGraphLink(o);
                    history.push(link);
                  }}
                >
                  <GraphLogo inputColor={theme.secondary} width={"1rem"} height={"1rem"} />
                </span>
              ) : null}
            </span>
            <OwnershipDetail
              ownership={o}
              investment={investment}
              investor={investor}
              availableYears={getYears(ownerships)}
            />
          </div>
          <div className="w-full px-1 sm:px-3 py-1 sm:py-2">
            <div className="w-full" style={{ borderBottom: `0.5px solid ${theme.primary}` }}></div>
          </div>
        </Fragment>
      ))}
    </div>
  );
};
