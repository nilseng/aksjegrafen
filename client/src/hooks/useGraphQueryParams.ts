import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { GraphNode, GraphType } from "../models/models";
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
    const sourceOrgnr = query.get("sourceOrgnr");
    const targetOrgnr = query.get("targetOrgnr");
    const isDirected = query.get("isDirected");
    if (graphType && isGraphType(graphType)) dispatch(setGraphType(graphType));
    // Orgnr-based params give stable, human-readable share URLs (node uuids are
    // internal); they resolve to a uuid through the API before loading the graph.
    if (!sourceUuid && sourceOrgnr) {
      fetchNodeUuid(sourceOrgnr).then((uuid) => dispatch(setSourceUuid(uuid)));
    } else {
      dispatch(setSourceUuid(sourceUuid ?? undefined));
    }
    if (!targetUuid && targetOrgnr) {
      fetchNodeUuid(targetOrgnr).then((uuid) => dispatch(setTargetUuid(uuid)));
    } else {
      dispatch(setTargetUuid(targetUuid ?? undefined));
    }
    if (isDirected) dispatch(setIsDirected(!!isDirected && isDirected !== "false"));
  }, [dispatch, query]);
};

const fetchNodeUuid = async (orgnr: string): Promise<string | undefined> => {
  try {
    const res = await fetch(`/api/node?orgnr=${orgnr}`);
    if (!res.ok) return undefined;
    const node: GraphNode | null = await res.json();
    return node?.properties.uuid;
  } catch {
    return undefined;
  }
};

const isGraphType = (type: string): type is GraphType => {
  return Object.values(GraphType).includes(type as GraphType);
};
