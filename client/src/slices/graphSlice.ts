import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchState, GraphNode, GraphType } from "../models/models";

export interface GraphState {
  data: {
    nodes: GraphNode[];
    links: { sourceUuid: string; targetUuid: string }[];
  };
  status: FetchState;
  error?: string | null;
}

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
}

async function fetchNeighbours({ uuid, limit, skip }: { uuid: string; limit: number; skip: number }) {
  const res = await fetch(`/api/graph/neighbours?uuid=${uuid}&limit=${limit}&skip=${skip}`);
  return res.json();
}

export const graphReducer = graphSlice.reducer;
