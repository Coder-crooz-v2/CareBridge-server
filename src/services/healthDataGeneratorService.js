/**
 * Health Data Generator Service
 * Generates random health data within realistic ranges for all users
 * Runs continuously every 10 seconds
 */

import { createSeededRng, seedFromString, randomWalk } from "../utils/prng.js";
import { getAllUsers } from "../models/userModel.js";
import { batchInsertHealthData } from "../models/healthDataModel.js";
import { isDatabaseEnabled } from "../config/database.js";

// Store per-user state for random walk continuity
const userStates = new Map();

// Generator interval reference
let generatorInterval = null;

// Configuration
const GENERATION_INTERVAL_MS = 10000; // 10 seconds

/**
 * Initialize or get user state for random walk
 * @param {string} userId - User UUID
 * @returns {Object} User state with RNG and current values
 */
function getOrCreateUserState(userId) {
  if (!userStates.has(userId)) {
    const seed = seedFromString(userId);
    const rng = createSeededRng(seed);

    // Initialize with random base values (deterministic from userId)
    const state = {
      rng,
      heartRate: 70 + Math.round(rng() * 10), // 70-80 base
      spo2: 96 + rng() * 3, // 96-99 base
      systolic: 115 + Math.round(rng() * 10), // 115-125 base
      diastolic: 75 + Math.round(rng() * 8), // 75-83 base
      temperature: 98 + rng() * 1.5, // 98-99.5 base
    };

    userStates.set(userId, state);
  }

  return userStates.get(userId);
}

/**
 * Generate health data for a single user
 * @param {string} userId - User UUID
 * @returns {Object} Generated health data
 */
function generateHealthDataForUser(userId) {
  const state = getOrCreateUserState(userId);

  // Apply random walk to each parameter
  state.heartRate = randomWalk(state.heartRate, state.rng, 6, 60, 100);
  state.spo2 = randomWalk(state.spo2, state.rng, 0.6, 95, 100);
  state.systolic = randomWalk(state.systolic, state.rng, 8, 100, 140);
  state.diastolic = randomWalk(state.diastolic, state.rng, 6, 60, 90);
  state.temperature = randomWalk(state.temperature, state.rng, 0.6, 97, 100);

  return {
    userId,
    heartRate: Math.round(state.heartRate),
    spo2: Math.round(state.spo2 * 10) / 10,
    systolic: Math.round(state.systolic),
    diastolic: Math.round(state.diastolic),
    temperature: Math.round(state.temperature * 10) / 10,
  };
}

/**
 * Generate and store health data for all users
 */
async function generateHealthDataForAllUsers() {
  try {
    // Get all registered users
    const users = await getAllUsers();

    if (users.length === 0) {
      console.log("[HealthDataGenerator] No users found, skipping generation");
      return;
    }

    // Generate health data for each user
    const healthDataArray = users.map((user) =>
      generateHealthDataForUser(user.id)
    );

    // Batch insert all records
    await batchInsertHealthData(healthDataArray);

    console.log(
      `[HealthDataGenerator] Generated health data for ${
        users.length
      } users at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error("[HealthDataGenerator] Error generating health data:", error);
  }
}

/**
 * Start the health data generator
 * Runs every 10 seconds
 */
export function startHealthDataGenerator() {
  if (!isDatabaseEnabled()) {
    console.warn(
      "[HealthDataGenerator] Database not configured, generator not started"
    );
    return;
  }

  if (generatorInterval) {
    console.warn("[HealthDataGenerator] Generator already running");
    return;
  }

  console.log(
    "[HealthDataGenerator] Starting health data generator (every 10s)..."
  );

  // Generate immediately on start
  generateHealthDataForAllUsers();

  // Then generate every 10 seconds
  generatorInterval = setInterval(
    generateHealthDataForAllUsers,
    GENERATION_INTERVAL_MS
  );

  console.log("[HealthDataGenerator] ✅ Health data generator started");
}

/**
 * Stop the health data generator
 */
export function stopHealthDataGenerator() {
  if (generatorInterval) {
    clearInterval(generatorInterval);
    generatorInterval = null;
    console.log("[HealthDataGenerator] Health data generator stopped");
  }
}

/**
 * Get generator status
 * @returns {Object} Status info
 */
export function getGeneratorStatus() {
  return {
    isRunning: !!generatorInterval,
    trackedUsers: userStates.size,
    intervalMs: GENERATION_INTERVAL_MS,
  };
}

/**
 * Clear user state (useful for testing)
 */
export function clearUserStates() {
  userStates.clear();
}
