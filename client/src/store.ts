import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { modalSlice } from "./slices/modalSlice";

export const store = configureStore({
  reducer: {
    modalHandler: modalSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
