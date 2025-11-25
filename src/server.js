/**
 * Health Monitoring Socket.IO Server
 * Main entry point
 */

import http from "http";
import app from "./app.js";
import { initializeSocket } from "./socket.js";

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🏥 Health Monitoring Socket.IO Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
