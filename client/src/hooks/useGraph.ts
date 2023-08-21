import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GraphType, UserEventType } from "../models/models";
import { GraphState, fetchGraphThunk } from "../slices/graphSlice";
import { captureUserEventThunk } from "../slices/userEventSlice";
import { AppDispatch, RootState } from "../store";
import { useGraphQueryParams } from "./useGraphQueryParams";

export const useGraph = () => {
  const dispatch = useDispatch<AppDispatch>();

  useGraphQueryParams();

  const {
    data: { graphType, sourceUuid, targetUuid, isDirected, source, target },
  } = useSelector<RootState, GraphState>((state) => state.graph);

  useEffect(() => {
    if (sourceUuid && graphType) {
      const res = dispatch(
        fetchGraphThunk({
          graphType,
          sourceUuid,
          targetUuid,
          isDirected,
          limit: 5,
          skip: 0,
        })
      );

      return () => {
        res.abort();
      };
    }
  }, [dispatch, graphType, isDirected, sourceUuid, targetUuid]);

  useEffect(() => {
    if (graphType === GraphType.Default && source) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.GraphLoad,
          uuid: source.properties.uuid,
          orgnr: source.properties.orgnr,
        })
      );
    }
  }, [dispatch, graphType, source]);

  useEffect(() => {
    if ((graphType === GraphType.ShortestPath || graphType === GraphType.AllPaths) && source) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.RelationSourceLoad,
          uuid: source.properties.uuid,
          orgnr: source.properties.orgnr,
        })
      );
    }
  }, [dispatch, graphType, source]);

  useEffect(() => {
    if ((graphType === GraphType.ShortestPath || graphType === GraphType.AllPaths) && target) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.RelationTargetLoad,
          uuid: target.properties.uuid,
          orgnr: target.properties.orgnr,
        })
      );
    }
  }, [dispatch, graphType, target]);
};
