import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  heartbeatReceived,
  socketConnected,
  socketConnecting,
  socketConnectionError,
  socketDisconnected,
  socketReconnectAttempt,
} from "../store/connectionSlice";
import {
  addPlcError,
  setBrowseResult,
  setPlcConnectionState,
  setTagValue,
  setWatchedTags,
} from "../store/plcSlice";
import { SOCKET_EVENTS } from "../services/socketEvents";
import { connectSocket, disconnectSocket } from "../services/socketClient";

export function useSocketConnection() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(socketConnecting());

    const socket = connectSocket();

    function handleConnect() {
      const timestamp = new Date().toISOString();

      dispatch(socketConnected({ socketId: socket.id, timestamp }));
    }

    function handleDisconnect() {
      dispatch(socketDisconnected({ timestamp: new Date().toISOString() }));
    }

    function handleConnectError(error) {
      dispatch(socketConnectionError({ message: error.message }));
    }

    function handleReconnectAttempt(attempt) {
      dispatch(socketReconnectAttempt({ attempt }));
    }

    function handlePlcConnectionState(payload) {
      dispatch(setPlcConnectionState(payload));
    }

    function handlePlcBrowseResult(payload) {
      dispatch(setBrowseResult(payload));
      dispatch(heartbeatReceived({ timestamp: payload.timestamp }));
    }

    function handlePlcSnapshot(payload) {
      dispatch(setWatchedTags({ watchedTags: payload.watchedTags || [] }));
      dispatch(heartbeatReceived({ timestamp: payload.timestamp }));
    }

    function handlePlcTagUpdate(payload) {
      dispatch(setTagValue(payload));
      dispatch(heartbeatReceived({ timestamp: payload.timestamp }));
    }

    function handlePlcError(payload) {
      dispatch(addPlcError(payload));
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.on(SOCKET_EVENTS.connectionState, handlePlcConnectionState);
    socket.on(SOCKET_EVENTS.plcBrowseResult, handlePlcBrowseResult);
    socket.on(SOCKET_EVENTS.plcSnapshot, handlePlcSnapshot);
    socket.on(SOCKET_EVENTS.plcTagUpdate, handlePlcTagUpdate);
    socket.on(SOCKET_EVENTS.plcError, handlePlcError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.off(SOCKET_EVENTS.connectionState, handlePlcConnectionState);
      socket.off(SOCKET_EVENTS.plcBrowseResult, handlePlcBrowseResult);
      socket.off(SOCKET_EVENTS.plcSnapshot, handlePlcSnapshot);
      socket.off(SOCKET_EVENTS.plcTagUpdate, handlePlcTagUpdate);
      socket.off(SOCKET_EVENTS.plcError, handlePlcError);
      disconnectSocket();
    };
  }, [dispatch]);
}
