import { useEffect } from "react";
import { useGraphQueryParams } from "./useGraphQueryParams";
import { useNode } from "./useNode";

export enum GraphType {
  Default = "Default",
  ShortestPath = "ShortestPath",
  AllPaths = "AllPaths",
}

export const useGraph = () => {
  const { graphType, sourceId, targetId } = useGraphQueryParams();

  const source = useNode(sourceId);
  const target = useNode(targetId);

  useEffect(() => {
    if (graphType === GraphType.Default) {
    }
  }, [graphType]);
};
