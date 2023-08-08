import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { toast } from "react-toastify";
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
    menu: {
      isOpen: boolean;
      position: {
        x?: number;
        y?: number;
      };
      node?: GraphNode;
    };
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
    setSourceUuid: (state: GraphState, action: PayloadAction<string | undefined>) => void;
    setTargetUuid: (state: GraphState, action: PayloadAction<string | undefined>) => void;
    setIsDirected: (state: GraphState, action: PayloadAction<boolean>) => void;
    setSource: (state: GraphState, action: PayloadAction<GraphNode | undefined>) => void;
    setTarget: (state: GraphState, action: PayloadAction<GraphNode | undefined>) => void;
    openMenu: (
      state: GraphState,
      action: PayloadAction<{ node: GraphNode; position: { x: number; y: number } }>
    ) => void;
    closeMenu: (state: GraphState) => void;
  },
  "graph"
>({
  name: "graph",
  initialState: {
    data: {
      graphType: GraphType.Default,
      nodes: [],
      links: [],
      menu: {
        isOpen: false,
        position: {},
      },
    },
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
    setTarget: (state, action) => {
      state.data.target = action.payload;
    },
    openMenu: (state, action) => {
      state.data.menu = { isOpen: true, node: action.payload.node, position: action.payload.position };
    },
    closeMenu: (state) => {
      state.data.menu = { isOpen: false, node: undefined, position: {} };
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
        if (action.error.name === "AbortError") return;
        state.status = FetchState.Error;
        state.error = action.error.message;
      })
      // Fetch actors cases
      .addCase(fetchActorsThunk.pending, (_, action) => {
        toast(`Laster aktører i ${action.meta.arg.node.properties.name}`, { type: toast.TYPE.INFO, autoClose: 1000 });
      })
      .addCase(fetchActorsThunk.fulfilled, (state, action) => {
        const source = state.data.nodes.find((node) => node.properties.uuid === action.meta.arg.node.properties.uuid);
        if (!source) {
          throw Error(`Could not update skip, source with id=${action.meta.arg.node.properties.uuid} not found.`);
        }
        source.skip = source.skip
          ? { ...source.skip, actors: (source.skip.actors += action.payload.nodes.length - 1) }
          : { actors: action.payload.nodes.length - 1, units: 0, investments: 0, investors: 0 };
        const newNodesCount = addToGraphIfNotExist(state, action);
        toast(`Lastet ${newNodesCount} nye aktører i ${action.meta.arg.node.properties.name}.`, {
          type: newNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
        });
      })
      .addCase(fetchActorsThunk.rejected, (_, action) => {
        toast(`Kunne ikke laste aktører i ${action.meta.arg.node.properties.name}`, { type: toast.TYPE.ERROR });
      })
      // Fetch role units cases
      .addCase(fetchRoleUnitsThunk.pending, (_, action) => {
        toast(`Laster rollene til ${action.meta.arg.node.properties.name}`, { type: toast.TYPE.INFO, autoClose: 1000 });
      })
      .addCase(fetchRoleUnitsThunk.fulfilled, (state, action) => {
        const source = state.data.nodes.find((node) => node.properties.uuid === action.meta.arg.node.properties.uuid);
        if (!source) {
          throw Error(`Could not update skip, source with id=${action.meta.arg.node.properties.uuid} not found.`);
        }
        source.skip = source.skip
          ? { ...source.skip, units: (source.skip.units += action.payload.nodes.length - 1) }
          : { units: action.payload.nodes.length - 1, actors: 0, investments: 0, investors: 0 };
        const newNodesCount = addToGraphIfNotExist(state, action);
        toast(`Lastet ${newNodesCount} av rollene til ${action.meta.arg.node.properties.name}.`, {
          type: newNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
        });
      })
      .addCase(fetchRoleUnitsThunk.rejected, (_, action) => {
        toast(`Kunne ikke laste rollene til ${action.meta.arg.node.properties.name}`, { type: toast.TYPE.ERROR });
      })
      // Fetch investors cases
      .addCase(fetchInvestorsThunk.pending, (_, action) => {
        toast(`Laster investorer i ${action.meta.arg.node.properties.name}`, {
          type: toast.TYPE.INFO,
          autoClose: 1000,
        });
      })
      .addCase(fetchInvestorsThunk.fulfilled, (state, action) => {
        const source = state.data.nodes.find((node) => node.properties.uuid === action.meta.arg.node.properties.uuid);
        if (!source) {
          throw Error(`Could not update skip, source with id=${action.meta.arg.node.properties.uuid} not found.`);
        }
        source.skip = source.skip
          ? { ...source.skip, investors: (source.skip.investors += action.payload.nodes.length - 1) }
          : { investors: action.payload.nodes.length - 1, actors: 0, investments: 0, units: 0 };
        const newNodesCount = addToGraphIfNotExist(state, action);
        toast(`Lastet ${newNodesCount} av investorene til ${action.meta.arg.node.properties.name}.`, {
          type: newNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
        });
      })
      .addCase(fetchInvestorsThunk.rejected, (_, action) => {
        toast(`Kunne ikke laste investorene til ${action.meta.arg.node.properties.name}`, { type: toast.TYPE.ERROR });
      })
      // Fetch investments cases
      .addCase(fetchInvestmentsThunk.pending, (_, action) => {
        toast(`Laster investeringene til ${action.meta.arg.node.properties.name}`, {
          type: toast.TYPE.INFO,
          autoClose: 1000,
        });
      })
      .addCase(fetchInvestmentsThunk.fulfilled, (state, action) => {
        const source = state.data.nodes.find((node) => node.properties.uuid === action.meta.arg.node.properties.uuid);
        if (!source) {
          throw Error(`Could not update skip, source with id=${action.meta.arg.node.properties.uuid} not found.`);
        }
        source.skip = source.skip
          ? { ...source.skip, investments: (source.skip.investments += action.payload.nodes.length - 1) }
          : { investments: action.payload.nodes.length - 1, actors: 0, units: 0, investors: 0 };
        const newNodesCount = addToGraphIfNotExist(state, action);
        toast(`Lastet ${newNodesCount} av investeringene til ${action.meta.arg.node.properties.name}.`, {
          type: newNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
        });
      })
      .addCase(fetchInvestmentsThunk.rejected, (_, action) => {
        toast(`Kunne ikke laste investeringene til ${action.meta.arg.node.properties.name}`, {
          type: toast.TYPE.ERROR,
        });
      });
  },
});

const addToGraphIfNotExist = (
  state: GraphState,
  action: PayloadAction<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>
) => {
  let newNodesCount = 0;
  const currentNodeIds = new Set(state.data.nodes.map((n) => n.properties.uuid));
  const currentLinkIds = new Set(
    state.data.links.map((l) => `${l.source.properties.uuid}-${l.target.properties.uuid}`)
  );
  for (const node of action.payload.nodes) {
    if (!currentNodeIds.has(node.properties.uuid)) {
      state.data.nodes.push(node);
      newNodesCount += 1;
    }
  }
  for (const link of action.payload.links) {
    if (!currentLinkIds.has(`${link.source.properties.uuid}-${link.target.properties.uuid}`)) {
      state.data.links.push(link);
    }
  }
  state.status = FetchState.Success;
  return newNodesCount;
};

export const { setGraphType, setSourceUuid, setTargetUuid, setSource, setTarget, setIsDirected, openMenu, closeMenu } =
  graphSlice.actions;

export const fetchSourceThunk = createAsyncThunk("graph/fetchSource", fetchNode);
export const fetchTargetThunk = createAsyncThunk("graph/fetchTarget", fetchNode);

async function fetchNode(uuid: string): Promise<GraphNode> {
  const res = await fetch(`/api/node?uuid=${uuid}`);
  return res.json();
}

export const fetchGraphThunk = createAsyncThunk("graph/fetchGraph", fetchGraph);

function fetchGraph(
  {
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
  },
  { signal }: { signal: AbortSignal }
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  if (graphType === GraphType.Default) return fetchNeighbours({ uuid: sourceUuid, limit, skip }, { signal });
  if (graphType === GraphType.ShortestPath) {
    return fetchShortestPath({ isDirected, sourceUuid, targetUuid }, { signal });
  }
  if (graphType === GraphType.AllPaths) return fetchAllPaths({ isDirected, sourceUuid, targetUuid, limit }, { signal });
  throw Error("Unknown graph type");
}

async function fetchNeighbours(
  {
    uuid,
    limit,
    skip,
  }: {
    uuid: string;
    limit: number;
    skip: number;
  },
  { signal }: { signal: AbortSignal }
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const res = await fetch(`/api/graph/neighbours?uuid=${uuid}&limit=${limit}&skip=${skip}`, { signal });
  return res.json();
}

async function fetchShortestPath(
  {
    isDirected,
    sourceUuid,
    targetUuid,
  }: {
    isDirected?: boolean;
    sourceUuid: string;
    targetUuid?: string;
  },
  { signal }: { signal: AbortSignal }
) {
  if (!targetUuid) throw Error("Målnode ikke definert...");
  const query = buildQuery({ isDirected, sourceUuid, targetUuid });
  const res = await fetch(`/api/graph/shortest-path${query}`, { signal });
  if (!res.ok) throw Error("Beklager, noe gikk galt! Tar søket mer enn 30 sekunder, feiler det automatisk...");
  return res.json();
}

async function fetchAllPaths(
  {
    isDirected,
    sourceUuid,
    targetUuid,
    limit,
  }: {
    isDirected?: boolean;
    sourceUuid: string;
    targetUuid?: string;
    limit?: number;
  },
  { signal }: { signal: AbortSignal }
) {
  if (!targetUuid) throw Error("Målnode ikke definert...");
  const query = buildQuery({ isDirected, sourceUuid, targetUuid, limit });
  const res = await fetch(`/api/graph/all-paths${query}`, { signal });
  if (!res.ok) throw Error("Beklager, noe gikk galt! Tar søket mer enn 30 sekunder, feiler det automatisk...");
  return res.json();
}

export const fetchActorsThunk = createAsyncThunk("graph/fetchActors", fetchActors);

async function fetchActors(
  { node, limit, skip }: { node: GraphNode; limit: number; skip?: number },
  { signal }: { signal: AbortSignal }
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const query = buildQuery({ uuid: node.properties.uuid, limit, skip });
  const res = await fetch(`/api/graph/actors${query}`, { signal });
  return res.json();
}

export const fetchRoleUnitsThunk = createAsyncThunk("graph/fetchRoleUnits", fetchRoleUnits);

async function fetchRoleUnits(
  { node, limit, skip }: { node: GraphNode; limit: number; skip?: number },
  { signal }: { signal: AbortSignal }
) {
  const query = buildQuery({ uuid: node.properties.uuid, limit, skip });
  const res = await fetch(`/api/graph/role-units${query}`, { signal });
  return res.json();
}

export const fetchInvestorsThunk = createAsyncThunk("graph/fetchInvestors", fetchInvestors);

async function fetchInvestors(
  { node, limit, skip }: { node: GraphNode; limit: number; skip?: number },
  { signal }: { signal: AbortSignal }
) {
  const query = buildQuery({ uuid: node.properties.uuid, limit, skip });
  const res = await fetch(`/api/graph/investors${query}`, { signal });
  return res.json();
}

export const fetchInvestmentsThunk = createAsyncThunk("graph/fetchInvestments", fetchInvestments);

async function fetchInvestments(
  { node, limit, skip }: { node: GraphNode; limit: number; skip?: number },
  { signal }: { signal: AbortSignal }
) {
  const query = buildQuery({ uuid: node.properties.uuid, limit, skip });
  const res = await fetch(`/api/graph/investments${query}`, { signal });
  return res.json();
}

export const graphReducer = graphSlice.reducer;
