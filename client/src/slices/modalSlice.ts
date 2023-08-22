import { PayloadAction, createSlice } from "@reduxjs/toolkit";
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
}

export const modalSlice = createSlice<
  ModalState,
  {
    open: (state: ModalState) => void;
    close: (state: ModalState) => void;
    setContent: (
      state: ModalState,
      action: PayloadAction<{ content: ModalContent; source?: GraphNode; target?: GraphNode }>
    ) => void;
  }
>({
  name: "modalHandler",
  initialState: {
    isOpen: true,
    content: ModalContent.NodeSearch,
  },
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
  },
});

export const { open, close, setContent } = modalSlice.actions;
