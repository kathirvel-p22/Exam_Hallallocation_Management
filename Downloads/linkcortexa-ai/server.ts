import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  // Mock Database initialization
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  
  const USERS_FILE = path.join(DATA_DIR, "users.json");
  const THREATS_FILE = path.join(DATA_DIR, "threats.json");
  const VAULT_FILE = path.join(DATA_DIR, "vault.json");

  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  if (!fs.existsSync(THREATS_FILE)) fs.writeFileSync(THREATS_FILE, JSON.stringify([]));
  if (!fs.existsSync(VAULT_FILE)) fs.writeFileSync(VAULT_FILE, JSON.stringify([]));

  // Import Routes
  const authRoutes = (await import("./backend/routes/auth")).default;
  const analyzeRoutes = (await import("./backend/routes/analyze")).default;
  const secureRoutes = (await import("./backend/routes/secure")).default;

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/analyze", analyzeRoutes);
  app.use("/api/secure", secureRoutes);

  // Real-time Service
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Vite middleware for development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`LinkCortexa AI Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
