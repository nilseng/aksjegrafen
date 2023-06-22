import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { useGraph } from "../../hooks/useGraph";
import { FetchState, GraphType } from "../../models/models";
import { GraphState, fetchSourceThunk, fetchTargetThunk, setSource, setTarget } from "../../slices/graphSlice";
import { ModalContent, setContent } from "../../slices/modalSlice";
import { fetchRolesThunk } from "../../slices/rolesSlice";
import { AppDispatch, RootState } from "../../store";
import Loading from "../Loading";
import { GraphView } from "./GraphView";
import { Modal } from "./Modal";
import { Toolbar } from "./Toolbar";

export const Graph = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { theme } = useContext(AppContext);

  const { sourceUuid, targetUuid, graphType, isDirected } = useSelector<RootState, RootState["graph"]["data"]>(
    (state) => state.graph.data
  );

  useEffect(() => {
    if (sourceUuid) dispatch(fetchSourceThunk(sourceUuid));
    else dispatch(setSource(undefined));
  }, [dispatch, sourceUuid]);

  useEffect(() => {
    if (targetUuid) dispatch(fetchTargetThunk(targetUuid));
    else dispatch(setTarget(undefined));
  }, [dispatch, targetUuid]);

  useEffect(() => {
    if (graphType !== GraphType.Default && sourceUuid) dispatch(setContent(ModalContent.PathSearch));
  }, [dispatch, graphType, sourceUuid]);

  useGraph();
  useEffect(() => {
    dispatch(fetchRolesThunk());
  }, [dispatch]);

  const isModalOpen = useSelector<RootState, boolean>((state) => state.modalHandler.isOpen);

  const { status, error } = useSelector<RootState, GraphState>((state) => state.graph);

  return (
    <div className="flex w-full h-full dark:text-white px-2 sm:px-4 pb-2 sm:pb-4 pt-0">
      <div className="relative flex justify-center items-center w-full h-full" style={{ ...theme.lowering }}>
        {isModalOpen && <Modal />}
        <Toolbar />
        {status === FetchState.Loading && (
          <Loading
            backgroundColor="transparent"
            color={theme.primary}
            text={isDirected === false ? "Søk som ikke er rettet kan ta litt tid...⏳" : ""}
          />
        )}
        {status === FetchState.Success && <GraphView />}
        {status === FetchState.Error && <p className="text-primary text-sm">{error}</p>}
      </div>
    </div>
  );
};
