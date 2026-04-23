import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedArea: "Line 1",
  telemetryRefreshMode: "live",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSelectedArea(state, action) {
      state.selectedArea = action.payload.area;
    },
    setTelemetryRefreshMode(state, action) {
      state.telemetryRefreshMode = action.payload.mode;
    },
  },
});

export const { setSelectedArea, setTelemetryRefreshMode } =
  settingsSlice.actions;

export default settingsSlice.reducer;
