import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { GraphLinkType, GraphNode, GraphType } from "../models/models";
import { setGraphType, setIsDirected, setLinkTypes, setSourceUuid, setTargetUuid } from "../slices/graphSlice";
import { AppDispatch } from "../store";
import { useQuery } from "./useQuery";

export const useGraphQueryParams = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const query = useQuery();

  useEffect(() => {
    // Orgnr-based params give stable, human-readable share URLs (node uuids are
    // internal). They are resolved to uuids ONCE and the URL is replaced, so the
    // reactive flow below only ever sees uuid params — dispatching the resolved
    // uuid asynchronously instead would fight the Graph component's effect cleanup
    // (which resets sourceUuid) and rerender forever.
    if (query.get("sourceOrgnr") || query.get("targetOrgnr")) {
      resolveOrgnrParams(query).then((params) => history.replace({ search: `?${params.toString()}` }));
      return;
    }

    const graphType = query.get("graphType");
    const sourceUuid = query.get("sourceUuid");
    const targetUuid = query.get("targetUuid");
    const isDirected = query.get("isDirected");
    if (graphType && isGraphType(graphType)) dispatch(setGraphType(graphType));
    dispatch(setSourceUuid(sourceUuid ?? undefined));
    dispatch(setTargetUuid(targetUuid ?? undefined));
    if (isDirected) dispatch(setIsDirected(!!isDirected && isDirected !== "false"));
  }, [dispatch, history, query]);

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

const resolveOrgnrParams = async (query: URLSearchParams): Promise<URLSearchParams> => {
  const params = new URLSearchParams(query.toString());
  const sourceOrgnr = params.get("sourceOrgnr");
  const targetOrgnr = params.get("targetOrgnr");
  params.delete("sourceOrgnr");
  params.delete("targetOrgnr");
  if (sourceOrgnr && !params.get("sourceUuid")) {
    const uuid = await fetchNodeUuid(sourceOrgnr);
    if (uuid) params.set("sourceUuid", uuid);
  }
  if (targetOrgnr && !params.get("targetUuid")) {
    const uuid = await fetchNodeUuid(targetOrgnr);
    if (uuid) params.set("targetUuid", uuid);
  }
  return params;
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
