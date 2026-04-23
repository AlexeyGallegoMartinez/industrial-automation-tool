const { RockwellPlcService } = require("../plc/rockwellPlcService");
const { SOCKET_EVENTS } = require("./socketEvents");

const plcService = new RockwellPlcService();

function registerPlcSocketHandlers(io, client) {
  emitConnectionState(client);

  client.on(SOCKET_EVENTS.plcConnect, async (payload = {}, ack) => {
    try {
      const state = await plcService.connect(payload);
      io.emit(SOCKET_EVENTS.connectionState, state);

      if (ack) {
        ack({ ok: true, state });
      }
    } catch (error) {
      io.emit(SOCKET_EVENTS.connectionState, plcService.getConnectionState());
      handlePlcError(client, ack, "PLC connection failed.", error);
    }
  });

  client.on(SOCKET_EVENTS.plcDisconnect, async (_, ack) => {
    try {
      const state = await plcService.disconnect();
      io.emit(SOCKET_EVENTS.connectionState, state);

      if (ack) {
        ack({ ok: true, state });
      }
    } catch (error) {
      handlePlcError(client, ack, "PLC disconnect failed.", error);
    }
  });

  client.on(SOCKET_EVENTS.plcBrowse, async (_, ack) => {
    try {
      const result = await plcService.browseTags();
      client.emit(SOCKET_EVENTS.plcBrowseResult, result);

      if (ack) {
        ack({ ok: true, result });
      }
    } catch (error) {
      handlePlcError(client, ack, "PLC browse failed.", error);
    }
  });

  client.on(SOCKET_EVENTS.plcSubscribeTags, async (payload = {}, ack) => {
    try {
      const watchedTags = plcService.subscribeTags(payload.tags || []);

      plcService.startPolling(
        (tagValue) => {
          io.emit(SOCKET_EVENTS.plcTagUpdate, tagValue);
        },
        (error, tag) => {
          io.emit(SOCKET_EVENTS.plcError, {
            message: "PLC tag read failed.",
            detail: error.message,
            tag: tag
              ? {
                  id: `${tag.program || "controller"}:${tag.name}`,
                  name: tag.name,
                  program: tag.program || null,
                  dataType: tag.type?.typeName || "unknown",
                }
              : null,
            timestamp: new Date().toISOString(),
          });
        },
      );

      const snapshot = {
        watchedTags,
        timestamp: new Date().toISOString(),
      };

      io.emit(SOCKET_EVENTS.plcSnapshot, snapshot);

      if (ack) {
        ack({ ok: true, snapshot });
      }
    } catch (error) {
      handlePlcError(client, ack, "PLC tag subscription failed.", error);
    }
  });

  client.on(SOCKET_EVENTS.plcUnsubscribeTags, async (payload = {}, ack) => {
    try {
      const watchedTags = plcService.unsubscribeTags(payload.tags || []);
      const snapshot = {
        watchedTags,
        timestamp: new Date().toISOString(),
      };

      io.emit(SOCKET_EVENTS.plcSnapshot, snapshot);

      if (watchedTags.length === 0) {
        plcService.stopPolling();
      }

      if (ack) {
        ack({ ok: true, snapshot });
      }
    } catch (error) {
      handlePlcError(client, ack, "PLC tag unsubscribe failed.", error);
    }
  });
}

function emitConnectionState(client) {
  client.emit(SOCKET_EVENTS.connectionState, plcService.getConnectionState());
}

function handlePlcError(client, ack, message, error) {
  const payload = {
    message,
    detail: error.message,
    timestamp: new Date().toISOString(),
  };

  client.emit(SOCKET_EVENTS.plcError, payload);

  if (ack) {
    ack({ ok: false, error: payload });
  }
}

module.exports = {
  registerPlcSocketHandlers,
};
