const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const socket = require("./socket");
const { registerSocketHandlers } = require("./services/realtime/socketServer");

// Load correct .env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: path.resolve(__dirname, envFile) });

// ROUTES
// const authRoutes = require("./routes/auth");

const app = express();
const clientOrigin = process.env.CORS_ORIGIN || "*";
const frontendDistPath = path.resolve(__dirname, "../websockets-frontend/dist");

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", clientOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// API Routes
// app.use("/auth", authRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "websockets-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.static(frontendDistPath));

app.get(/^(?!\/api\/|\/health|\/socket\.io\/).*/, (req, res, next) => {
  res.sendFile(path.join(frontendDistPath, "index.html"), (error) => {
    if (error) {
      next(error);
    }
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  res.status(status).json({ message: error.message, data: error.data });
});

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, HOST, async () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Server is running on port ${PORT} [${process.env.NODE_ENV}]`);
  //   await initializeDB();
});

const io = socket.init(server, { origin: clientOrigin });
registerSocketHandlers(io);
