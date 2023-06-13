import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FetchState } from "../models/models";
import { GraphState, fetchGraphThunk } from "../slices/graphSlice";
import { AppDispatch, RootState } from "../store";
import { useGraphQueryParams } from "./useGraphQueryParams";
import { useNode } from "./useNode";

export const useGraph = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { graphType, sourceUuid, targetUuid } = useGraphQueryParams();

  const { node: source, isLoading: isLoadingSource } = useNode(sourceUuid);
  const { node: target, isLoading: isLoadingTarget } = useNode(targetUuid);

  useEffect(() => {
    if (!isLoadingSource && !isLoadingTarget && source) {
      dispatch(
        fetchGraphThunk({
          graphType,
          sourceUuid: source.properties.uuid,
          targetUuid: target?.properties.uuid,
          limit: 5,
          skip: 0,
        })
      );
    }
  }, [dispatch, graphType, isLoadingSource, isLoadingTarget, source, target]);

  const { data, status, error } = useSelector<RootState, GraphState>((state) => state.graph);

  useEffect(() => {
    setIsLoading(isLoadingSource || isLoadingTarget || status === FetchState.Loading);
  }, [isLoadingSource, isLoadingTarget, status]);

  return {
    status: isLoading ? FetchState.Loading : status,
    data: { ...data, source, target, graphType },
    error,
  };
};
