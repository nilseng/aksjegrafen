import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { GraphType } from "../models/models";
import { setGraphType, setIsDirected, setSourceUuid, setTargetUuid } from "../slices/graphSlice";
import { AppDispatch } from "../store";
import { useQuery } from "./useQuery";

export const useGraphQueryParams = () => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery();

  useEffect(() => {
    const graphType = query.get("graphType");
    const sourceUuid = query.get("sourceUuid");
    const targetUuid = query.get("targetUuid");
    const isDirected = query.get("isDirected");
    if (graphType && isGraphType(graphType)) dispatch(setGraphType(graphType));
    dispatch(setSourceUuid(sourceUuid ?? undefined));
    dispatch(setTargetUuid(targetUuid ?? undefined));
    if (isDirected) dispatch(setIsDirected(!!isDirected && isDirected !== "false"));
  }, [dispatch, query]);
};

const isGraphType = (type: string): type is GraphType => {
  return Object.values(GraphType).includes(type as GraphType);
};
