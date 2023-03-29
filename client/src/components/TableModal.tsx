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
    tableModalInput: { investment, setInvestment, investor, setInvestor },
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
    const root = document.getElementById("root");
    if (root) root.style.overflow = "visible";
  };

  const { investors, loading: loadingInvestors } = useInvestors(investment, undefined, 20);
  const { investments, loading: loadingInvestments } = useInvestments(investor, undefined, 20);

  return investment || investor ? (
    <div
      className="position-fixed w-100 h-100 d-flex justify-content-center rounded px-2"
      style={{ top: 0, zIndex: 10000 }}
    >
      <div className="w-100 h-100 position-absolute overflow-hidden" onClick={closeModal}></div>
      <div
        className="w-100 h-75 position-relative d-flex flex-column small mt-5 p-4"
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
            <h5>
              Investeringer i {investment?.name} <span style={{ color: theme.muted }}>({investment?.orgnr})</span>
            </h5>
            <div className="w-100 overflow-auto flex-fill">
              <OwnershipTable ownerships={investors} />
            </div>
          </>
        )}
        {investments?.length && (
          <>
            <h5>Aksjebeholding for {investor?.name}</h5>
            <div className="w-100 overflow-auto flex-fill">
              <OwnershipTable ownerships={investments} />
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;
};
