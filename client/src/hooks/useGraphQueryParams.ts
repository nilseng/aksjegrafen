import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { GraphLinkType, GraphNode, GraphType } from "../models/models";
import { setGraphType, setIsDirected, setLinkTypes, setSourceUuid, setTargetUuid } from "../slices/graphSlice";
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

  // Depends on the raw param string, not the query object (a fresh instance every render),
  // so the link-type filter is only re-applied when the URL actually changes — otherwise it
  // would fight the Settings panel, which manages the same filter interactively.
  const linkTypesParam = query.get("linkTypes");
  useEffect(() => {
    if (!linkTypesParam) return;
    const linkTypes = linkTypesParam.split(",").filter(isGraphLinkType);
    if (linkTypes.length > 0) dispatch(setLinkTypes(linkTypes));
  }, [dispatch, linkTypesParam]);
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

const isGraphLinkType = (type: string): type is GraphLinkType => {
  return Object.values(GraphLinkType).includes(type as GraphLinkType);
};
