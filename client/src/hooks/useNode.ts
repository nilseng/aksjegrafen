import { useEffect, useState } from "react";
import { GraphNode } from "../models/models";

export const useNode = (id?: string) => {
  const [node, setNode] = useState<GraphNode>();
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getNode(id)
        .then((n) => {
          setNode(n);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  return { node, isLoading };
};

const getNode = async (id: string): Promise<GraphNode> => {
  const res = await fetch(`/api/node?id=${id}`);
  return res.json();
};
