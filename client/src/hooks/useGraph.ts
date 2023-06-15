import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GraphState, fetchGraphThunk, setGraphType, setSourceUuid, setTargetUuid } from "../slices/graphSlice";
import { AppDispatch, RootState } from "../store";
import { useGraphQueryParams } from "./useGraphQueryParams";

export const useGraph = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { graphType, sourceUuid, targetUuid } = useGraphQueryParams();

  const graphState = useSelector<RootState, GraphState>((state) => state.graph);

  useEffect(() => {
    dispatch(setGraphType(graphType));
  }, [dispatch, graphType]);

  useEffect(() => {
    if (sourceUuid) {
      dispatch(setSourceUuid(sourceUuid));
    }
  }, [dispatch, sourceUuid]);

  useEffect(() => {
    if (targetUuid) {
      dispatch(setTargetUuid(targetUuid));
    }
  }, [dispatch, targetUuid]);

  useEffect(() => {
    if (sourceUuid) {
      dispatch(
        fetchGraphThunk({
          graphType,
          sourceUuid,
          targetUuid,
          limit: 5,
          skip: 0,
        })
      );
    }
  }, [dispatch, graphType, sourceUuid, targetUuid]);

  return graphState;
};
