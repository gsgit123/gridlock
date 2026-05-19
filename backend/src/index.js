import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PORT, CLIENT_URL } from "./config.js";
import { regSocketHandlers } from "./socket/handlers.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = CLIENT_URL.split(",").map((u) => u.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: allowedOrigins }));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Gridlock server running" });
});

regSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Gridlock server running on port ${PORT}`);
  console.log(`Accepting connections from: ${allowedOrigins.join(", ")}`);
  console.log(`Grid size: 50x50`);
});
