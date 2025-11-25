/**
 * Socket.IO Controller
 * Handles WebSocket connection events and real-time vital signs streaming
 */

import {
  createClientState,
  generateVitalSigns,
  updateClientState,
  getClientState,
  setClientState,
  deleteClientState,
} from "../services/vitalSignsService.js";

// Track connected clients count
let connectedClients = 0;

/**
 * Get current connected clients count
 * @returns {number} Number of connected clients
 */
export function getConnectedClientsCount() {
  return connectedClients;
}

/**
 * Handle new socket connection
 * @param {Object} socket - Socket.IO socket instance
 */
export function handleConnection(socket) {
  connectedClients++;

  // Get userId from query params or auth, fallback to socket.id
  const userId =
    socket.handshake.query.userId || socket.handshake.auth?.userId || socket.id;

  console.log(
    `Client connected: ${socket.id} (userId: ${userId}, Total: ${connectedClients})`
  );

  // Create per-client state seeded by userId (deterministic across reconnects if same userId)
  const state = createClientState(userId);
  setClientState(socket.id, state);

  // Send initial data immediately upon connection
  const initialData = generateVitalSigns(state);
  socket.emit("vital-signs", initialData);
  console.log(`Sent initial vital signs to ${socket.id}:`, {
    hr: initialData.heartRate,
    spo2: initialData.spo2,
    bp: `${initialData.systolic}/${initialData.diastolic}`,
    temp: initialData.temperature,
  });

  // Set up interval to send data every 10 seconds with random walk
  const dataInterval = setInterval(() => {
    const s = getClientState(socket.id);
    if (!s) return;

    // Update state with small random walk
    updateClientState(s);

    const vitalSigns = generateVitalSigns(s);
    socket.emit("vital-signs", vitalSigns);
    console.log(`Sent vital signs to ${socket.id}:`, {
      hr: vitalSigns.heartRate,
      spo2: vitalSigns.spo2,
      bp: `${vitalSigns.systolic}/${vitalSigns.diastolic}`,
      temp: vitalSigns.temperature,
    });
  }, 10000); // 10 seconds

  // Handle disconnect
  socket.on("disconnect", () => {
    connectedClients--;
    clearInterval(dataInterval);
    deleteClientState(socket.id);
    console.log(
      `Client disconnected: ${socket.id} (Total: ${connectedClients})`
    );
  });

  // Handle socket errors
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
}
