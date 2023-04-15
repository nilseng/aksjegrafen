import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { AppContext } from "../App";
import { useInvestments, useInvestors } from "../services/apiService";
import Loading from "./Loading";
import { OwnershipTable } from "./OwnershipTable";

export const TableModal = () => {
  const {
    theme,
    tableModalInput: { investment, setInvestment, investor, setInvestor, limit, skip, setSkip },
  } = useContext(AppContext);

  useEffect(() => {
    if (investor || investment) {
      const root = document.getElementById("root");
      if (root) root.style.overflow = "hidden";
    }
  }, [investment, investor]);

  const closeModal = () => {
    setInvestment(undefined);
    setInvestor(undefined);
    setSkip(0);
    const root = document.getElementById("root");
    if (root) root.style.overflow = "visible";
  };

  const { investors, loading: loadingInvestors } = useInvestors(investment, undefined, limit, skip);
  const { investments, loading: loadingInvestments } = useInvestments(investor, undefined, limit, skip);

  return investment || investor ? (
    <div
      className="position-fixed w-100 h-100 d-flex justify-content-center rounded px-2"
      style={{ top: 0, zIndex: 10000, color: theme.text }}
    >
      <div className="w-100 h-100 position-absolute overflow-hidden" onClick={closeModal}></div>
      <div
        className="w-100 h-75 position-relative d-flex flex-column justify-content-between small mt-5 p-4"
        style={{ backgroundColor: theme.backgroundSecondary, ...theme.elevation, zIndex: 10001, maxWidth: "720px" }}
      >
        <FontAwesomeIcon
          icon={faTimes}
          className="position-absolute mr-4"
          style={{ cursor: "pointer", right: 0, zIndex: 10002 }}
          onClick={closeModal}
        />
        {(loadingInvestments || loadingInvestors) && (
          <Loading height="4rem" color={theme.primary} backgroundColor="transparent" />
        )}
        {investors?.length && (
          <>
            <h5 className="pb-3">
              Aksjonærer i {investment?.name} <span style={{ color: theme.muted }}>({investment?.orgnr})</span>
            </h5>
            <div className="w-100 overflow-auto flex-fill rounded" style={theme.borderPrimary}>
              <OwnershipTable ownerships={investors} investment={investment} closeModal={closeModal} />
            </div>
          </>
        )}
        {investments?.length && (
          <>
            <h5>Investeringene til {investor?.name}</h5>
            <div className="w-100 overflow-auto flex-fill rounded" style={theme.borderPrimary}>
              <OwnershipTable ownerships={investments} investor={investor} closeModal={closeModal} />
            </div>
          </>
        )}
        <div className="w-100 d-flex justify-content-between pt-2">
          <button
            className="btn btn-sm btn-primary"
            disabled={skip < limit}
            onClick={() => {
              if (skip >= limit) setSkip(skip - limit);
            }}
          >
            Forrige {limit}
          </button>
          <button
            className="btn btn-sm btn-primary"
            disabled={!!(((investments?.length ?? 0) + (investors?.length ?? 0)) % limit)}
            onClick={() => {
              if (!(((investments?.length ?? 0) + (investors?.length ?? 0)) % limit)) setSkip(skip + limit);
            }}
          >
            Neste {limit}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
