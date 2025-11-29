/**
 * Health Monitoring Socket.IO Server
 * Main entry point
 */

import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initializeSocket } from "./socket.js";
import {
  startHealthDataGenerator,
  stopHealthDataGenerator,
} from "./services/healthDataGeneratorService.js";
import {
  startDataCleanupScheduler,
  stopDataCleanupScheduler,
} from "./services/dataCleanupService.js";
import { isDatabaseEnabled } from "./config/database.js";

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start background services (database-dependent)
if (isDatabaseEnabled()) {
  console.log("Database enabled, starting background services...");
  startHealthDataGenerator();
  startDataCleanupScheduler();
} else {
  console.log("Database not configured. Background services disabled.");
  console.log(
    "   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env to enable."
  );
}

// Start server
server.listen(PORT, () => {
  console.log(`Health Monitoring Socket.IO Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(
    `Health data API: http://localhost:${PORT}/api/health-data/status`
  );
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`${signal} received, closing server...`);

  // Stop background services
  stopHealthDataGenerator();
  stopDataCleanupScheduler();

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
