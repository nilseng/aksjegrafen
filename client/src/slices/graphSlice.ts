import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { FetchState, GraphLink, GraphNode, GraphType } from "../models/models";
import { buildQuery } from "../utils/buildQuery";

export interface GraphState {
  data: {
    graphType: GraphType;
    sourceUuid?: string;
    targetUuid?: string;
    isDirected?: boolean;
    source?: GraphNode;
    target?: GraphNode;
    nodes: GraphNode[];
    links: GraphLink[];
  };
  status: FetchState;
  error?: string | null;
}

export type GraphNodeDatum = GraphNode & SimulationNodeDatum & { id: string };
export type GraphLinkDatum = SimulationLinkDatum<GraphNodeDatum> & Pick<GraphLink, "properties" | "type">;

export const graphSlice = createSlice<
  GraphState,
  {
    setGraphType: (state: GraphState, action: PayloadAction<GraphType>) => void;
    setSourceUuid: (state: GraphState, action: PayloadAction<string>) => void;
    setTargetUuid: (state: GraphState, action: PayloadAction<string>) => void;
    setIsDirected: (state: GraphState, action: PayloadAction<boolean>) => void;
    setSource: (state: GraphState, action: PayloadAction<GraphNode>) => void;
  },
  "graph"
>({
  name: "graph",
  initialState: {
    data: { graphType: GraphType.Default, nodes: [], links: [] },
    status: FetchState.Idle,
    error: null,
  },
  reducers: {
    setGraphType: (state, action) => {
      state.data.graphType = action.payload;
    },
    setSourceUuid: (state, action) => {
      state.data.sourceUuid = action.payload;
    },
    setTargetUuid: (state, action) => {
      state.data.targetUuid = action.payload;
    },
    setIsDirected: (state, action) => {
      state.data.isDirected = action.payload;
    },
    setSource: (state, action) => {
      state.data.source = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch source cases
      .addCase(fetchSourceThunk.pending, (state) => {
        state.data.source = undefined;
        state.status = FetchState.Loading;
      })
      .addCase(fetchSourceThunk.fulfilled, (state, action: PayloadAction<GraphNode>) => {
        state.data.source = action.payload;
      })
      .addCase(fetchSourceThunk.rejected, (state) => {
        state.status = FetchState.Error;
      })
      // Fetch target cases
      .addCase(fetchTargetThunk.pending, (state) => {
        state.data.target = undefined;
        state.status = FetchState.Loading;
      })
      .addCase(fetchTargetThunk.fulfilled, (state, action: PayloadAction<GraphNode>) => {
        state.data.target = action.payload;
      })
      .addCase(fetchTargetThunk.rejected, (state) => {
        state.status = FetchState.Error;
      })
      // Fetch graph cases
      .addCase(fetchGraphThunk.pending, (state) => {
        state.status = FetchState.Loading;
      })
      .addCase(
        fetchGraphThunk.fulfilled,
        (state, action: PayloadAction<{ nodes: GraphNode[]; links: GraphLink[] }>) => {
          state.status = FetchState.Success;
          state.data.nodes = action.payload.nodes;
          state.data.links = action.payload.links;
        }
      )
      .addCase(fetchGraphThunk.rejected, (state, action) => {
        state.status = FetchState.Error;
        state.error = action.error.message;
      });
  },
});

export const { setGraphType, setSourceUuid, setTargetUuid, setSource, setIsDirected } = graphSlice.actions;

export const fetchSourceThunk = createAsyncThunk("graph/fetchSource", fetchNode);
export const fetchTargetThunk = createAsyncThunk("graph/fetchTarget", fetchNode);

async function fetchNode(uuid: string): Promise<GraphNode> {
  const res = await fetch(`/api/node?uuid=${uuid}`);
  return res.json();
}

export const fetchGraphThunk = createAsyncThunk("graph/fetchGraph", fetchGraph);

function fetchGraph({
  graphType,
  sourceUuid,
  targetUuid,
  isDirected,
  limit,
  skip,
}: {
  graphType: GraphType;
  sourceUuid: string;
  targetUuid?: string;
  isDirected?: boolean;
  limit: number;
  skip: number;
}) {
  if (isDirected === false) throw Error("Not implemented yet.");
  if (graphType === GraphType.Default) return fetchNeighbours({ uuid: sourceUuid, limit, skip });
  if (graphType === GraphType.ShortestPath) return fetchShortestPath({ sourceUuid, targetUuid });
  if (graphType === GraphType.AllPaths) return fetchAllPaths({ sourceUuid, targetUuid, limit });
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

async function fetchShortestPath({ sourceUuid, targetUuid }: { sourceUuid: string; targetUuid?: string }) {
  if (!targetUuid) throw Error("Målnode ikke definert...");
  const query = buildQuery({ sourceUuid, targetUuid });
  const res = await fetch(`/api/graph/shortest-path${query}`);
  return res.json();
}

async function fetchAllPaths({
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
  const res = await fetch(`/api/graph/all-paths${query}`);
  return res.json();
}

export const graphReducer = graphSlice.reducer;
