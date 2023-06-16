import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchState } from "../models/models";

interface RoleTypeResponse {
  _embedded: {
    rolletyper: {
      kode: string;
      beskrivelse: string;
      _links: {
        self: {
          href: string;
        };
      };
    }[];
  };
  _links: {
    self: {
      href: string;
    };
  };
}

export interface RolesState {
  data: RoleTypeResponse["_embedded"]["rolletyper"];
  status: FetchState;
  error: string | null;
}

export const rolesSlice = createSlice<RolesState, {}>({
  name: "roles",
  initialState: {
    data: [],
    status: FetchState.Idle,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending, (state) => {
        state.status = FetchState.Loading;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.data = action.payload._embedded?.rolletyper;
        state.status = FetchState.Success;
      })
      .addCase(fetchRolesThunk.rejected, (state) => {
        state.status = FetchState.Error;
      });
  },
});

export const fetchRolesThunk = createAsyncThunk("roles/fetchRoleTypes", fetchRoleTypes);

async function fetchRoleTypes(): Promise<RoleTypeResponse> {
  const res = await fetch("https://data.brreg.no/enhetsregisteret/api/roller/rolletyper");
  return res ? res.json() : res;
}
