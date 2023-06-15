import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { useGraph } from "../../hooks/useGraph";
import { FetchState } from "../../models/models";
import { RootState } from "../../store";
import Loading from "../Loading";
import { GraphView } from "./GraphView";
import { Modal } from "./Modal";
import { Toolbar } from "./Toolbar";

export const Graph = () => {
  const { theme } = useContext(AppContext);

  const isModalOpen = useSelector<RootState, boolean>((state) => state.modalHandler.isOpen);

  const { status, error } = useGraph();

  return (
    <div className="flex w-full h-full px-2 sm:px-4 pb-2 sm:pb-4 pt-0">
      <div className="relative flex justify-center items-center w-full h-full" style={{ ...theme.lowering }}>
        {isModalOpen && <Modal />}
        <Toolbar />
        {status === FetchState.Loading && <Loading backgroundColor="transparent" color={theme.primary} />}
        {status === FetchState.Success && <GraphView />}
        {status === FetchState.Error && <p>{error}</p>}
      </div>
    </div>
  );
};
