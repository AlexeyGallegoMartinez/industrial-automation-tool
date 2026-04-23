const { registerPlcSocketHandlers } = require("./plcSocketHandlers");

function registerSocketHandlers(io) {
  io.on("connection", (client) => {
    console.log(`Socket connected: ${client.id}`);
    registerPlcSocketHandlers(io, client);

    client.on("disconnect", () => {
      console.log(`Socket disconnected: ${client.id}`);
    });
  });
}

module.exports = {
  registerSocketHandlers,
};
