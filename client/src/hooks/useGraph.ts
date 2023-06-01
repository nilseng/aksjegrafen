import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GraphState, fetchGraphThunk } from "../slices/graphSlice";
import { AppDispatch, RootState } from "../store";
import { useGraphQueryParams } from "./useGraphQueryParams";
import { useNode } from "./useNode";

export const useGraph = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { graphType, sourceId, targetId } = useGraphQueryParams();

  const { node: source } = useNode(sourceId);
  const { node: target } = useNode(targetId);

  useEffect(() => {
    if (source) {
      dispatch(
        fetchGraphThunk({
          graphType,
          sourceUuid: source?.properties.uuid,
          targetUuid: target?.properties.uuid,
          limit: 10,
          skip: 0,
        })
      );
    }
  }, [dispatch, graphType, source, target?.properties.uuid]);

  return useSelector<RootState, GraphState>((state) => state.graph);
};
