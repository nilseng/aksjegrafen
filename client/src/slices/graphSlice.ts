import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { toast } from "react-toastify";
import {
  CurrentRole,
  FetchState,
  GraphLink,
  GraphLinkType,
  GraphNode,
  GraphNodeSkip,
  GraphType,
} from "../models/models";
import { buildQuery } from "../utils/buildQuery";

export interface GraphState {
  data: {
    graphType?: GraphType;
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
    filter: Filter;
  };
  status: FetchState;
  error?: string | null;
}

interface Filter {
  linkTypes: GraphLinkType[];
  ownershipShareThreshold?: number;
}

export type GraphNodeDatum = GraphNode & SimulationNodeDatum & { id: string };
export type GraphLinkDatum = SimulationLinkDatum<GraphNodeDatum> & Pick<GraphLink, "properties" | "type">;

const initialState = {
  data: {
    graphType: undefined,
    nodes: [],
    links: [],
    menu: {
      isOpen: false,
      position: {},
    },
    filter: {
      linkTypes: [],
      ownershipShareThreshold: 0,
    },
  },
  status: FetchState.Idle,
  error: null,
};

export const graphSlice = createSlice<
  GraphState,
  {
    setGraphType: (state: GraphState, action: PayloadAction<GraphType>) => void;
    setSourceUuid: (state: GraphState, action: PayloadAction<string | undefined>) => void;
    setTargetUuid: (state: GraphState, action: PayloadAction<string | undefined>) => void;
    setIsDirected: (state: GraphState, action: PayloadAction<boolean>) => void;
    setSource: (state: GraphState, action: PayloadAction<GraphNode | undefined>) => void;
    setTarget: (state: GraphState, action: PayloadAction<GraphNode | undefined>) => void;
    setFilter: (state: GraphState, action: PayloadAction<Filter>) => void;
    openMenu: (
      state: GraphState,
      action: PayloadAction<{ node: GraphNode; position: { x: number; y: number } }>
    ) => void;
    closeMenu: (state: GraphState) => void;
    resetGraph: (state: GraphState) => void;
  },
  "graph"
>({
  name: "graph",
  initialState,
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
    setFilter: (state, action) => {
      state.data.filter = action.payload;
    },
    openMenu: (state, action) => {
      state.data.menu = { isOpen: true, node: action.payload.node, position: action.payload.position };
    },
    closeMenu: (state) => {
      state.data.menu = { isOpen: false, node: undefined, position: {} };
    },
    resetGraph: (state) => {
      state.status = initialState.status;
      state.error = initialState.error;
      state.data = initialState.data;
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
        const { addedNodesCount, newNodesCount, source } = handleNewNodes({
          state,
          action,
          uuid: action.meta.arg.node.properties.uuid,
          role: CurrentRole.Unit,
          type: "actors",
        });
        showActorsToast({ addedNodesCount, newNodesCount, node: source });
      })
      .addCase(fetchActorsThunk.rejected, (_, action) => {
        toast(`Kunne ikke laste aktører i ${action.meta.arg.node.properties.name}`, { type: toast.TYPE.ERROR });
      })
      // Fetch role units cases
      .addCase(fetchRoleUnitsThunk.pending, (_, action) => {
        toast(`Laster rollene til ${action.meta.arg.node.properties.name}`, { type: toast.TYPE.INFO, autoClose: 1000 });
      })
      .addCase(fetchRoleUnitsThunk.fulfilled, (state, action) => {
        const { addedNodesCount, newNodesCount, source } = handleNewNodes({
          state,
          action,
          uuid: action.meta.arg.node.properties.uuid,
          role: CurrentRole.Actor,
          type: "units",
        });
        showRolesToast({ node: source, addedNodesCount, newNodesCount });
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
        const { addedNodesCount, newNodesCount, source } = handleNewNodes({
          state,
          action,
          uuid: action.meta.arg.node.properties.uuid,
          role: CurrentRole.Investment,
          type: "investors",
        });
        showInvestorsToast({ addedNodesCount, newNodesCount, node: source });
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
        const { addedNodesCount, newNodesCount, source } = handleNewNodes({
          state,
          action,
          uuid: action.meta.arg.node.properties.uuid,
          role: CurrentRole.Investor,
          type: "investments",
        });
        showInvestmentsToast({ addedNodesCount, newNodesCount, node: source });
      })
      .addCase(fetchInvestmentsThunk.rejected, (_, action) => {
        toast(`Kunne ikke laste investeringene til ${action.meta.arg.node.properties.name}`, {
          type: toast.TYPE.ERROR,
        });
      });
  },
});

const handleNewNodes = ({
  state,
  action,
  uuid,
  type,
  role,
}: {
  state: GraphState;
  action: PayloadAction<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>;
  uuid: string;
  type: keyof GraphNodeSkip;
  role: CurrentRole;
}) => {
  const source = findSourceOrThrow({ nodes: state.data.nodes, uuid });
  const newNodesCount = getNewNodesCount(action.payload.nodes);
  if (newNodesCount) source.skip = source.skip = getSkip({ source, newNodesCount, type });
  const addedNodesCount = addToGraphIfNotExist(state, action);
  if (addedNodesCount && !source.currentRoles?.includes(role)) {
    source.currentRoles?.push(role);
  }
  return { addedNodesCount, newNodesCount, source };
};

const findSourceOrThrow = ({ nodes, uuid }: { nodes: GraphNode[]; uuid: string }): GraphNode => {
  const source = nodes.find((node) => node.properties.uuid === uuid);
  if (!source) {
    throw Error(`Could not update skip, source with id=${uuid} not found.`);
  }
  return source;
};

const getNewNodesCount = (nodes: GraphNode[]) => {
  // If nodes are returned, adjust for the source node, otherwise assume 0 new nodes.
  return nodes.length ? nodes.length - 1 : 0;
};

const getSkip = ({
  source,
  newNodesCount,
  type,
}: {
  source: GraphNode;
  newNodesCount: number;
  type: keyof GraphNodeSkip;
}): GraphNodeSkip => {
  return source.skip
    ? { ...source.skip, [type]: (source.skip[type] += newNodesCount) }
    : { ...{ actors: 0, units: 0, investments: 0, investors: 0 }, [type]: newNodesCount };
};

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
      currentNodeIds.add(node.properties.uuid);
      state.data.nodes.push(node);
      newNodesCount += 1;
    }
  }
  for (const link of action.payload.links) {
    if (!currentLinkIds.has(`${link.source.properties.uuid}-${link.target.properties.uuid}`)) {
      currentLinkIds.add(`${link.source.properties.uuid}-${link.target.properties.uuid}`);
      state.data.links.push(link);
    }
  }
  state.status = FetchState.Success;
  return newNodesCount;
};

const showActorsToast = ({
  addedNodesCount,
  newNodesCount,
  node,
}: {
  addedNodesCount: number;
  newNodesCount: number;
  node: GraphNode;
}) => {
  if (addedNodesCount) {
    toast(`Lastet ${addedNodesCount} av aktørene i ${node.properties.name}.`, {
      type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
    });
  } else if (newNodesCount) {
    toast(
      `Lastet ${newNodesCount} av aktørene i ${node.properties.name}. ${newNodesCount} av nodene var allerede i grafen.`,
      { type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO }
    );
  } else if (node.skip?.actors) {
    toast(`Fant ikke flere aktører for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  } else {
    toast(`Fant ingen aktører for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  }
};

const showRolesToast = ({
  addedNodesCount,
  newNodesCount,
  node,
}: {
  addedNodesCount: number;
  newNodesCount: number;
  node: GraphNode;
}) => {
  if (addedNodesCount) {
    toast(`Lastet ${addedNodesCount} av rollene til ${node.properties.name}.`, {
      type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
    });
  } else if (newNodesCount) {
    toast(
      `Lastet ${newNodesCount} av rollene til ${node.properties.name}. ${newNodesCount} av nodene var allerede i grafen.`,
      { type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO }
    );
  } else if (node.skip?.units) {
    toast(`Fant ikke flere roller for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  } else {
    toast(`Fant ingen roller for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  }
};

const showInvestorsToast = ({
  addedNodesCount,
  newNodesCount,
  node,
}: {
  addedNodesCount: number;
  newNodesCount: number;
  node: GraphNode;
}) => {
  if (addedNodesCount) {
    toast(`Lastet ${addedNodesCount} av investorene til ${node.properties.name}.`, {
      type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
    });
  } else if (newNodesCount) {
    toast(
      `Lastet ${newNodesCount} av investorene til ${node.properties.name}. ${newNodesCount} av nodene var allerede i grafen.`,
      { type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO }
    );
  } else if (node.skip?.investors) {
    toast(`Fant ikke flere investorer for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  } else {
    toast(`Fant ingen investorer for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  }
};

const showInvestmentsToast = ({
  addedNodesCount,
  newNodesCount,
  node,
}: {
  addedNodesCount: number;
  newNodesCount: number;
  node: GraphNode;
}) => {
  if (addedNodesCount) {
    toast(`Lastet ${addedNodesCount} av investeringene til ${node.properties.name}.`, {
      type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
    });
  } else if (newNodesCount) {
    toast(
      `Lastet ${newNodesCount} av investeringene til ${node.properties.name}. ${newNodesCount} av nodene var allerede i grafen.`,
      { type: addedNodesCount ? toast.TYPE.SUCCESS : toast.TYPE.INFO }
    );
  } else if (node.skip?.investments) {
    toast(`Fant ikke flere investeringer for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  } else {
    toast(`Fant ingen investeringer for ${node.properties.name}.`, { type: toast.TYPE.INFO });
  }
};

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
    linkTypes,
    limit,
    skip,
  }: {
    graphType: GraphType;
    sourceUuid: string;
    targetUuid?: string;
    isDirected?: boolean;
    linkTypes?: GraphLinkType[];
    limit: number;
    skip: number;
  },
  { signal }: { signal: AbortSignal }
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  if (graphType === GraphType.Default) {
    return fetchNeighbours({ uuid: sourceUuid, linkTypes, limit, skip }, { signal });
  }
  if (graphType === GraphType.ShortestPath) {
    return fetchShortestPath({ isDirected, sourceUuid, targetUuid, linkTypes }, { signal });
  }
  if (graphType === GraphType.AllPaths)
    return fetchAllPaths({ isDirected, sourceUuid, targetUuid, linkTypes, limit }, { signal });
  throw Error("Unknown graph type");
}

async function fetchNeighbours(
  {
    uuid,
    linkTypes,
    limit,
    skip,
  }: {
    uuid: string;
    linkTypes?: GraphLinkType[];
    limit: number;
    skip: number;
  },
  { signal }: { signal: AbortSignal }
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const query = buildQuery({ uuid, linkTypes, limit, skip });
  const res = await fetch(`/api/graph/neighbours${query}`, { signal });
  return res.json();
}

async function fetchShortestPath(
  {
    isDirected,
    sourceUuid,
    targetUuid,
    linkTypes,
  }: {
    isDirected?: boolean;
    sourceUuid: string;
    targetUuid?: string;
    linkTypes?: GraphLinkType[];
  },
  { signal }: { signal: AbortSignal }
) {
  if (!targetUuid) throw Error("Målnode ikke definert...");
  const query = buildQuery({ isDirected, sourceUuid, targetUuid, linkTypes });
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
    linkTypes,
  }: {
    isDirected?: boolean;
    sourceUuid: string;
    targetUuid?: string;
    linkTypes?: GraphLinkType[];
    limit?: number;
  },
  { signal }: { signal: AbortSignal }
) {
  if (!targetUuid) throw Error("Målnode ikke definert...");
  const query = buildQuery({ isDirected, sourceUuid, targetUuid, linkTypes, limit });
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
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const query = buildQuery({ uuid: node.properties.uuid, limit, skip });
  const res = await fetch(`/api/graph/role-units${query}`, { signal });
  return res.json();
}

export const fetchInvestorsThunk = createAsyncThunk("graph/fetchInvestors", fetchInvestors);

async function fetchInvestors(
  { node, limit, skip }: { node: GraphNode; limit: number; skip?: number },
  { signal }: { signal: AbortSignal }
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const query = buildQuery({ uuid: node.properties.uuid, limit, skip });
  const res = await fetch(`/api/graph/investors${query}`, { signal });
  return res.json();
}

export const fetchInvestmentsThunk = createAsyncThunk("graph/fetchInvestments", fetchInvestments);

async function fetchInvestments(
  { node, limit, skip }: { node: GraphNode; limit: number; skip?: number },
  { signal }: { signal: AbortSignal }
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const query = buildQuery({ uuid: node.properties.uuid, limit, skip });
  const res = await fetch(`/api/graph/investments${query}`, { signal });
  return res.json();
}

export const {
  setGraphType,
  setSourceUuid,
  setTargetUuid,
  setSource,
  setTarget,
  setIsDirected,
  setFilter,
  openMenu,
  closeMenu,
  resetGraph,
} = graphSlice.actions;
