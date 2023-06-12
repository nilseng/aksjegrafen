import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { FetchState, GraphLink, GraphNode, GraphType } from "../models/models";
import { buildQuery } from "../utils/buildQuery";

export interface GraphState {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  status: FetchState;
  error?: string | null;
}

export type GraphNodeDatum = GraphNode & SimulationNodeDatum & { id: string };
export type GraphLinkDatum = SimulationLinkDatum<GraphNodeDatum> & Pick<GraphLink, "properties" | "type">;

export const graphSlice = createSlice<GraphState, {}, "graph">({
  name: "graph",
  initialState: {
    data: { nodes: [], links: [] },
    status: FetchState.Idle,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGraphThunk.pending, (state) => {
        state.status = FetchState.Loading;
      })
      .addCase(fetchGraphThunk.fulfilled, (state, action) => {
        state.status = FetchState.Success;
        state.data = action.payload;
      })
      .addCase(fetchGraphThunk.rejected, (state, action) => {
        state.status = FetchState.Error;
        state.error = action.error.message;
      });
  },
});

export const fetchGraphThunk = createAsyncThunk("graph/fetchNeighbours", fetchGraph);

function fetchGraph({
  graphType,
  sourceUuid,
  targetUuid,
  limit,
  skip,
}: {
  graphType: GraphType;
  sourceUuid: string;
  targetUuid?: string;
  limit: number;
  skip: number;
}) {
  if (graphType === GraphType.Default) return fetchNeighbours({ uuid: sourceUuid, limit, skip });
  if (graphType === GraphType.ShortestPath) {
    fetchShortestPath({ sourceUuid, targetUuid, limit });
    return { nodes: [], links: [] };
  }
  if (graphType === GraphType.AllPaths) throw Error("Not implemented yet.");
  throw Error("Unknown graph type");
}

async function fetchNeighbours({
  uuid,
  limit,
  skip,
}: {
  uuid: string;
  limit: number;
  skip: number;
}): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const res = await fetch(`/api/graph/neighbours?uuid=${uuid}&limit=${limit}&skip=${skip}`);
  return res.json();
}

async function fetchShortestPath({
  sourceUuid,
  targetUuid,
  limit,
}: {
  sourceUuid: string;
  targetUuid?: string;
  limit?: number;
}) {
  if (!targetUuid) throw Error("Målnode ikke definert...");
  const query = buildQuery({ sourceUuid, targetUuid, limit });
  const res = await fetch(`/api/graph/shortest-path${query}`);
  return res.json();
}

export const graphReducer = graphSlice.reducer;
