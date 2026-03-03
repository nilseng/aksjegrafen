import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { agentTeamSlice } from "./slices/agentTeamSlice";
import { graphSlice } from "./slices/graphSlice";
import { modalSlice } from "./slices/modalSlice";
import { rolesSlice } from "./slices/rolesSlice";

export const store = configureStore({
  reducer: {
    modalHandler: modalSlice.reducer,
    graph: graphSlice.reducer,
    roles: rolesSlice.reducer,
    agentTeam: agentTeamSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
