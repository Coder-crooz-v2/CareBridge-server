/**
 * Vital Signs Service
 * Handles generation and management of per-user vital signs data
 */

import { createSeededRng, seedFromString, randomWalk } from "../utils/prng.js";

// Store per-client state (keyed by socket.id)
const clientStates = new Map();

/**
 * Create initial client state with per-user base vitals
 * @param {string} seedStr - Seed string (userId or socket.id)
 * @returns {Object} Client state with RNG and base vital values
 */
export function createClientState(seedStr) {
  const seed = seedFromString(seedStr);
  const rng = createSeededRng(seed);

  // Base values slightly randomized per client (deterministic from seed)
  const baseHeartRate = 70 + Math.round(rng() * 10); // 70-80
  const baseSpo2 = 96 + rng() * 3; // 96-99
  const baseSystolic = 115 + Math.round(rng() * 10); // 115-125
  const baseDiastolic = 75 + Math.round(rng() * 8); // 75-83
  const baseTemperature = 98 + rng() * 1.5; // 98-99.5

  return {
    rng,
    heartRate: baseHeartRate,
    spo2: baseSpo2,
    systolic: baseSystolic,
    diastolic: baseDiastolic,
    temperature: baseTemperature,
  };
}

/**
 * Generate vital signs from current state
 * @param {Object} state - Client state
 * @returns {Object} Formatted vital signs data
 */
export function generateVitalSigns(state) {
  return {
    timestamp: new Date().toISOString(),
    heartRate: Math.round(state.heartRate),
    spo2: Math.round(state.spo2 * 10) / 10,
    systolic: Math.round(state.systolic),
    diastolic: Math.round(state.diastolic),
    temperature: Math.round(state.temperature * 10) / 10,
  };
}

/**
 * Update client state using random walk
 * @param {Object} state - Client state to update
 */
export function updateClientState(state) {
  state.heartRate = randomWalk(state.heartRate, state.rng, 6, 60, 100);
  state.spo2 = randomWalk(state.spo2, state.rng, 0.6, 95, 100);
  state.systolic = randomWalk(state.systolic, state.rng, 8, 100, 140);
  state.diastolic = randomWalk(state.diastolic, state.rng, 6, 60, 90);
  state.temperature = randomWalk(state.temperature, state.rng, 0.6, 97, 100);
}

/**
 * Get client state by socket ID
 * @param {string} socketId - Socket ID
 * @returns {Object|undefined} Client state or undefined
 */
export function getClientState(socketId) {
  return clientStates.get(socketId);
}

/**
 * Set client state for a socket ID
 * @param {string} socketId - Socket ID
 * @param {Object} state - Client state
 */
export function setClientState(socketId, state) {
  clientStates.set(socketId, state);
}

/**
 * Delete client state for a socket ID
 * @param {string} socketId - Socket ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteClientState(socketId) {
  return clientStates.delete(socketId);
}

/**
 * Get total number of tracked clients
 * @returns {number} Number of clients with active state
 */
export function getClientStateCount() {
  return clientStates.size;
}
