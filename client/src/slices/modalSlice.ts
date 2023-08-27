import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GraphNode } from "../models/models";

export enum ModalContent {
  NodeSearch = "NodeSearch",
  PathSearch = "PathSearch",
  InvestorTable = "InvestorTable",
  InvestmentTable = "InvestmentTable",
  Details = "Details",
  Financials = "Financials",
}

export interface ModalState {
  isOpen: boolean;
  content: ModalContent;
  source?: GraphNode;
  target?: GraphNode;
  popularNodes?: GraphNode[];
}

const initialState = {
  isOpen: true,
  content: ModalContent.NodeSearch,
  source: undefined,
  target: undefined,
};

export const modalSlice = createSlice<
  ModalState,
  {
    open: (state: ModalState) => void;
    close: (state: ModalState) => void;
    setContent: (
      state: ModalState,
      action: PayloadAction<{ content: ModalContent; source?: GraphNode; target?: GraphNode }>
    ) => void;
    resetModal: (state: ModalState) => void;
  }
>({
  name: "modalHandler",
  initialState,
  reducers: {
    open: (state) => {
      state.isOpen = true;
    },
    close: (state) => {
      state.isOpen = false;
    },
    setContent: (state, action) => {
      state.content = action.payload.content;
      if (action.payload.source) state.source = action.payload.source;
      if (action.payload.target) state.target = action.payload.target;
    },
    resetModal: (state) => {
      state.isOpen = initialState.isOpen;
      state.content = initialState.content;
      state.source = initialState.source;
      state.target = initialState.target;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPopularNodesThunk.fulfilled, (state, action) => {
      state.popularNodes = action.payload;
    });
  },
});

export const { open, close, setContent, resetModal } = modalSlice.actions;

export const fetchPopularNodesThunk = createAsyncThunk("modal/popularNodes", fetchPopularNodes);

async function fetchPopularNodes() {
  const res = await fetch("/api/popular-nodes");
  return res.json();
}
