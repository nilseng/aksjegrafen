import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../AppContext";
import { useInvestments, useInvestors } from "../services/apiService";
import { GraphLogo } from "./GraphLogo";
import Loading from "./Loading";
import { OwnershipTable } from "./OwnershipTable";

export const TableModal = () => {
  const {
    theme,
    tableModalInput: { investment, setInvestment, investor, setInvestor, limit, skip, setSkip },
  } = useContext(AppContext);

  const history = useHistory();

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
      className="fixed w-full h-full flex justify-center rounded px-2"
      style={{ top: 0, zIndex: 10000, color: theme.text }}
    >
      <div className="w-full h-full absolute overflow-hidden" onClick={closeModal}></div>
      <div
        className="w-full h-3/4 relative flex flex-col justify-between text-sm mt-5 p-4"
        style={{ backgroundColor: theme.backgroundSecondary, ...theme.elevation, zIndex: 10001, maxWidth: "720px" }}
      >
        <FontAwesomeIcon
          icon={faTimes}
          className="absolute mr-4"
          style={{ cursor: "pointer", right: 0, zIndex: 10002 }}
          onClick={closeModal}
        />
        {(loadingInvestments || loadingInvestors) && (
          <Loading height="4rem" color={theme.primary} backgroundColor="transparent" />
        )}
        {investors?.length && (
          <>
            <h5 className="flex items-center text-xl pb-3">
              <span className="font-semibold mr-2">Aksjonærer i {investment?.name}</span>{" "}
              <span style={{ color: theme.muted }}>({investment?.orgnr})</span>
              <span
                className="flex justify-center items-center ml-2"
                style={{
                  ...theme.button,
                  cursor: "pointer",
                  borderRadius: "100%",
                  width: "3.2rem",
                  minWidth: "3.2rem",
                  height: "3.2rem",
                  minHeight: "3.2rem",
                }}
                onClick={() => {
                  closeModal();
                  history.push(`/graph?_id=${investment?._id}`);
                }}
              >
                <GraphLogo inputColor={theme.secondary} width={"2rem"} height={"2rem"} />
              </span>
            </h5>
            <div className="w-full overflow-auto grow rounded" style={theme.borderPrimary}>
              <OwnershipTable ownerships={investors} investment={investment} closeModal={closeModal} />
            </div>
          </>
        )}
        {investments?.length && (
          <>
            <h5 className="flex items-center text-xl pb-3">
              <span className="font-semibold mr-2">Investeringene til {investor?.name}</span>
              <span
                className="flex justify-center items-center ml-2"
                style={{
                  ...theme.button,
                  cursor: "pointer",
                  borderRadius: "100%",
                  width: "3.2rem",
                  minWidth: "3.2rem",
                  height: "3.2rem",
                  minHeight: "3.2rem",
                }}
                onClick={() => {
                  closeModal();
                  history.push(`/graph?shareholder_id=${investor?._id}`);
                }}
              >
                <GraphLogo inputColor={theme.secondary} width={"2rem"} height={"2rem"} />
              </span>
            </h5>
            <div className="w-full overflow-auto grow rounded" style={theme.borderPrimary}>
              <OwnershipTable ownerships={investments} investor={investor} closeModal={closeModal} />
            </div>
          </>
        )}
        <div className="w-full flex justify-between pt-2">
          <button
            className="rounded text-white p-2"
            style={{ backgroundColor: theme.primary }}
            disabled={skip < limit}
            onClick={() => {
              if (skip >= limit) setSkip(skip - limit);
            }}
          >
            Forrige {limit}
          </button>
          <button
            className="rounded text-white p-2"
            style={{ backgroundColor: theme.primary }}
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
