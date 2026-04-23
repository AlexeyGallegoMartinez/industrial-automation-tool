import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "disconnected",
  socketId: null,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  lastHeartbeatAt: null,
  reconnectAttempt: 0,
  error: null,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    socketConnecting(state) {
      state.status = "connecting";
      state.error = null;
    },
    socketConnected(state, action) {
      state.status = "connected";
      state.socketId = action.payload.socketId;
      state.lastConnectedAt = action.payload.timestamp;
      state.lastHeartbeatAt = action.payload.timestamp;
      state.reconnectAttempt = 0;
      state.error = null;
    },
    socketDisconnected(state, action) {
      state.status = "disconnected";
      state.socketId = null;
      state.lastDisconnectedAt = action.payload.timestamp;
    },
    socketConnectionError(state, action) {
      state.status = "error";
      state.error = action.payload.message;
    },
    socketReconnectAttempt(state, action) {
      state.status = "reconnecting";
      state.reconnectAttempt = action.payload.attempt;
    },
    heartbeatReceived(state, action) {
      state.lastHeartbeatAt = action.payload.timestamp;
    },
  },
});

export const {
  socketConnecting,
  socketConnected,
  socketDisconnected,
  socketConnectionError,
  socketReconnectAttempt,
  heartbeatReceived,
} = connectionSlice.actions;

export default connectionSlice.reducer;
