import { Fragment, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../App";
import { availableYears } from "../config";
import { IOwnership } from "../models/models";
import { GraphLogo } from "./GraphLogo";

const getGraphLink = (o: IOwnership): string => {
  if (o.investment) return `/graph?_id=${o.investment._id}`;
  if (o.investor?.company) return `/graph?_id=${o.investor.company._id}`;
  if (o.investor?.shareholder) return `/graph?shareholder_id=${o.investor.shareholder._id}`;
  throw Error(`Graph link not found for ownership w id=${o._id}`);
};

export const OwnershipTable = ({
  ownerships,
  type,
  closeModal,
}: {
  ownerships: IOwnership[];
  type: "investor" | "investment";
  closeModal: () => void;
}) => {
  const { theme } = useContext(AppContext);
  const history = useHistory();
  return (
    <div className="row pt-3 m-0">
      <p className="col-6 font-weight-bold small px-1 pl-sm-3 mb-1">Navn</p>
      <p className="col-6 font-weight-bold small px-1 mb-1">Antall aksjer</p>
      <p className="col-6"></p>
      {availableYears.map((year) => (
        <p key={year} className="col-2 small font-weight-bold px-1">
          {year}
        </p>
      ))}
      {ownerships.map((o) => (
        <Fragment key={o._id}>
          <span className="col-6 overflow-auto d-flex align-items-center px-1 pl-sm-3">
            <p className="m-0">{type === "investment" ? o.investor?.shareholder?.name : o.investment?.name}</p>
            <span
              className="ml-2"
              style={{
                ...theme.button,
                cursor: "pointer",
                borderRadius: "100%",
                display: "inline-block",
                textAlign: "center",
                verticalAlign: "middle",
                width: "1.6rem",
                height: "1.6rem",
                paddingTop: "0.1rem",
                paddingBottom: "0.1rem",
              }}
              onClick={() => {
                closeModal();
                history.push(getGraphLink(o));
              }}
            >
              <GraphLogo inputColor={theme.secondary} width={"1rem"} height={"1rem"} />
            </span>
          </span>
          {availableYears.map((year) => (
            <div key={year} className="col-2 overflow-auto px-1">
              <p>{o.holdings[year]?.total?.toLocaleString()}</p>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
};
