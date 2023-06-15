import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GraphState, fetchGraphThunk } from "../slices/graphSlice";
import { AppDispatch, RootState } from "../store";
import { useGraphQueryParams } from "./useGraphQueryParams";

export const useGraph = () => {
  const dispatch = useDispatch<AppDispatch>();

  useGraphQueryParams();

  const {
    data: { graphType, sourceUuid, targetUuid, isDirected },
  } = useSelector<RootState, GraphState>((state) => state.graph);

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
};
