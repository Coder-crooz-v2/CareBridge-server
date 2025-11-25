/**
 * Socket.IO Server Setup
 */

import { Server } from "socket.io";
import { socketConfig } from "./config/socket.js";
import { handleConnection } from "./controllers/socketController.js";

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, socketConfig);

  // Register connection handler
  io.on("connection", handleConnection);

  console.log("✅ Socket.IO server initialized");

  return io;
}
