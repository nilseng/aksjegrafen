import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { graphReducer } from "./slices/graphSlice";
import { modalSlice } from "./slices/modalSlice";

export const store = configureStore({
  reducer: {
    modalHandler: modalSlice.reducer,
    graph: graphReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
