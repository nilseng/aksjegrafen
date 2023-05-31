import { useEffect, useState } from "react";
import { GraphType } from "./useGraph";
import { useQuery } from "./useQuery";

export const useGraphQueryParams = () => {
  const query = useQuery();

  const [graphType, setGraphType] = useState<GraphType>(GraphType.Default);
  const [sourceId, setSourceId] = useState<string>();
  const [targetId, setTargetId] = useState<string>();

  useEffect(() => {
    const graphTypeParam = query.get("graphType");
    const sourceIdParam = query.get("sourceId");
    const targetIdParam = query.get("targetId");
    if (graphTypeParam && isGraphType(graphTypeParam)) setGraphType(graphTypeParam);
    if (sourceIdParam) setSourceId(sourceIdParam);
    if (targetIdParam) setTargetId(targetIdParam);

    return () => {
      setGraphType(GraphType.Default);
      setSourceId(undefined);
      setTargetId(undefined);
    };
  }, [query]);

  return { graphType, sourceId, targetId };
};

const isGraphType = (type: string): type is GraphType => {
  return Object.values(GraphType).includes(type as GraphType);
};
