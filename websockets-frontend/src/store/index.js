import { configureStore } from "@reduxjs/toolkit";
import connectionReducer from "./connectionSlice";
import plcReducer from "./plcSlice";
import settingsReducer from "./settingsSlice";

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
    plc: plcReducer,
    settings: settingsReducer,
  },
});
