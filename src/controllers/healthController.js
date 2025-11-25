/**
 * Health Check Controller
 * Handles health check and server info endpoints
 */

import { getConnectedClientsCount } from "./socketController.js";

/**
 * Get health check status
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export function getHealth(req, res) {
  res.json({
    status: "ok",
    connectedClients: getConnectedClientsCount(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get server information
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export function getServerInfo(req, res) {
  res.json({
    service: "Health Monitoring Socket.IO Server",
    version: "1.0.0",
    connectedClients: getConnectedClientsCount(),
    endpoints: {
      health: "/health",
      socket: "ws://localhost:3001",
    },
  });
}
