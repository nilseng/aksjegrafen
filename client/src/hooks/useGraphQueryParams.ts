import { useEffect, useState } from "react";
import { GraphType } from "../models/models";
import { useQuery } from "./useQuery";

export const useGraphQueryParams = () => {
  const query = useQuery();

  const [graphType, setGraphType] = useState<GraphType>(GraphType.Default);
  const [sourceUuid, setSourceId] = useState<string>();
  const [targetUuid, setTargetId] = useState<string>();

  useEffect(() => {
    const graphTypeParam = query.get("graphType");
    const sourceIdParam = query.get("sourceUuid");
    const targetIdParam = query.get("targetUuid");
    if (graphTypeParam && isGraphType(graphTypeParam)) setGraphType(graphTypeParam);
    if (sourceIdParam) setSourceId(sourceIdParam);
    if (targetIdParam) setTargetId(targetIdParam);

    return () => {
      setGraphType(GraphType.Default);
      setSourceId(undefined);
      setTargetId(undefined);
    };
  }, [query]);

  return { graphType, sourceUuid, targetUuid };
};

const isGraphType = (type: string): type is GraphType => {
  return Object.values(GraphType).includes(type as GraphType);
};
