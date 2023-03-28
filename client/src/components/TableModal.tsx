import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AppContext } from "../App";
import { useInvestments, useInvestors } from "../services/apiService";

export const TableModal = () => {
  const {
    theme,
    tableModalInput: { investment, setInvestment, investor, setInvestor },
  } = useContext(AppContext);

  const closeModal = () => {
    setInvestment(undefined);
    setInvestor(undefined);
  };

  const { investors } = useInvestors(investment, undefined, 20);
  const { investments } = useInvestments(investor, undefined, 20);

  return investment || investor ? (
    <div
      className="position-fixed w-100 h-100 d-flex justify-content-center rounded px-2"
      style={{ top: 0, zIndex: 10000 }}
    >
      <div className="w-100 h-100 position-absolute" onClick={closeModal}></div>
      <div
        className="w-100 h-75 position-relative mt-5 p-4"
        style={{ backgroundColor: theme.backgroundSecondary, ...theme.elevation, zIndex: 10001, maxWidth: "720px" }}
      >
        <FontAwesomeIcon
          icon={faTimes}
          className="position-absolute mr-4"
          style={{ cursor: "pointer", right: 0, zIndex: 10002 }}
          onClick={closeModal}
        />
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
            <div className="row">
              <p className="col">Navn</p>
              <p className="col">Antall aksjer</p>
            </div>
            {investments.map((i) => (
              <div key={i._id} className="row">
                <p className="col">{i.company?.name}</p>
                <p className="col">{i.shareholderStocks}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  ) : null;
};
