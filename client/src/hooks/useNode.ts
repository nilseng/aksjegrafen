import { useEffect, useState } from "react";
import { GraphNode } from "../models/models";

export const useNode = (uuid?: string) => {
  const [node, setNode] = useState<GraphNode>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (uuid) {
      setIsLoading(true);
      getNode(uuid)
        .then((n) => {
          setNode(n);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }

    return () => {
      setNode(undefined);
      setIsLoading(false);
    };
  }, [uuid]);

  return { node, isLoading };
};

const getNode = async (uuid: string): Promise<GraphNode> => {
  const res = await fetch(`/api/node?uuid=${uuid}`);
  return res.json();
};
