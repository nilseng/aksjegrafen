import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export enum ModalContent {
  NodeSearch = "NodeSearch",
  PathSearch = "PathSearch",
  InvestorTable = "InvestorTable",
  InvestmentTable = "InvestmentTable",
}

interface ModalState {
  isOpen: boolean;
  content: ModalContent;
}

export const modalSlice = createSlice<
  ModalState,
  {
    open: (state: ModalState) => void;
    close: (state: ModalState) => void;
    setContent: (state: ModalState, action: PayloadAction<ModalContent>) => void;
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
      state.content = action.payload;
    },
  },
});

export const { open, close, setContent } = modalSlice.actions;
