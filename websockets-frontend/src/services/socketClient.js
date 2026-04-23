import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";
let socket;

export function getSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
}

export function connectSocket() {
  const activeSocket = getSocket();

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  return activeSocket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export function getSocketUrl() {
  return socketUrl;
}

export function emitWithAck(eventName, payload = {}, timeoutMs = 15000) {
  const activeSocket = getSocket();

  return new Promise((resolve, reject) => {
    activeSocket.timeout(timeoutMs).emit(eventName, payload, (error, response) => {
      if (error) {
        reject(new Error("Request timed out or the server did not respond."));
        return;
      }

      if (!response?.ok) {
        reject(
          new Error(
            response?.error?.detail ||
              response?.error?.message ||
              "The PLC request failed.",
          ),
        );
        return;
      }

      resolve(response);
    });
  });
}
