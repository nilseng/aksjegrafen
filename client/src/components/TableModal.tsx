import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useContext, useEffect } from "react";
import { AppContext } from "../App";
import { useInvestments, useInvestors } from "../services/apiService";
import { CopyButton } from "./CopyButton";
import Loading from "./Loading";

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
            <div className="row">
              <p className="col">Navn</p>
              <p className="col">Antall aksjer</p>
            </div>
            {investors.map((i) => (
              <div key={i._id} className="row">
                <p className="col">{i.shareholder?.name}</p>
                <p className="col">{i.shareholder?.stocks}</p>
              </div>
            ))}
          </>
        )}
        {investments?.length && (
          <>
            <h5>Aksjebeholding for {investor?.name}</h5>
            <div className="w-100 overflow-auto flex-fill">
              <div className="row py-2 py-sm-4 m-0">
                <p className="col-6 font-weight-bold small">Selskap</p>
                <p className="col-3 font-weight-bold small">Antall aksjer</p>
                <p className="col-3 font-weight-bold small">År</p>
                {investments.map((i) => (
                  <Fragment key={i._id}>
                    <p className="col-6">{i.company?.name}</p>
                    <p className="col-3">
                      {(+i.shareholderStocks).toLocaleString()}
                      <CopyButton text={`${i.shareholderStocks}`} className="text-muted ml-1" />
                    </p>
                    <p className="col-3">{i.year}</p>
                  </Fragment>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;
};
