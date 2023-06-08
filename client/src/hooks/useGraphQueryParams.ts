import { useEffect, useState } from "react";
import { GraphType } from "../models/models";
import { useQuery } from "./useQuery";

export const useGraphQueryParams = () => {
  const query = useQuery();

  const [graphType, setGraphType] = useState<GraphType>(GraphType.Default);
  const [sourceUuid, setSourceUuid] = useState<string>();
  const [targetUuid, setTargetUuid] = useState<string>();

  useEffect(() => {
    const graphTypeParam = query.get("graphType");
    const sourceIdParam = query.get("sourceUuid");
    const targetIdParam = query.get("targetUuid");
    if (graphTypeParam && isGraphType(graphTypeParam)) setGraphType(graphTypeParam);
    if (sourceIdParam) setSourceUuid(sourceIdParam);
    if (targetIdParam) setTargetUuid(targetIdParam);

    return () => {
      setGraphType(GraphType.Default);
      setSourceUuid(undefined);
      setTargetUuid(undefined);
    };
  }, [query]);

  return { graphType, sourceUuid, targetUuid };
};

const isGraphType = (type: string): type is GraphType => {
  return Object.values(GraphType).includes(type as GraphType);
};
