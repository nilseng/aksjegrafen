import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchState, UserEvent } from "../models/models";

export interface UserEventState {
  data: {};
  fetchState: FetchState;
  error?: string | null;
}

export const userEventSlice = createSlice<UserEventState, {}, "userEvents">({
  name: "userEvents",
  initialState: {
    data: {},
    fetchState: FetchState.Idle,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(captureUserEventThunk.pending, (state) => {
        state.fetchState = FetchState.Loading;
      })
      .addCase(captureUserEventThunk.fulfilled, (state) => {
        state.fetchState = FetchState.Success;
      })
      .addCase(captureUserEventThunk.rejected, (state) => {
        state.fetchState = FetchState.Error;
      });
  },
});

export const captureUserEventThunk = createAsyncThunk("userEvents/capture", captureUserEvent);

export async function captureUserEvent(userEvent: UserEvent) {
  const res = await fetch(`/api/user-event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userEvent),
  });
  return res.json();
}
