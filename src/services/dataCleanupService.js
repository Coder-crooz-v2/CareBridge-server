/**
 * Data Cleanup Service
 * Periodically removes health data older than 1 hour
 * Runs every hour
 */

import {
  deleteOldHealthData,
  getHealthDataCount,
} from "../models/healthDataModel.js";
import { isDatabaseEnabled } from "../config/database.js";

// Cleanup interval reference
let cleanupInterval = null;

// Configuration
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const DATA_RETENTION_HOURS = 1; // Keep data for 1 hour

/**
 * Perform data cleanup - delete records older than retention period
 */
async function performCleanup() {
  try {
    const beforeCount = await getHealthDataCount();
    const result = await deleteOldHealthData(DATA_RETENTION_HOURS);
    const afterCount = await getHealthDataCount();

    console.log(
      `[DataCleanup] Cleanup completed at ${new Date().toISOString()}: ` +
        `Deleted ${result.deletedCount} records (${beforeCount} → ${afterCount})`
    );

    return result;
  } catch (error) {
    console.error("[DataCleanup] Error during cleanup:", error);
    throw error;
  }
}

/**
 * Start the data cleanup scheduler
 * Runs every hour
 */
export function startDataCleanupScheduler() {
  if (!isDatabaseEnabled()) {
    console.warn(
      "[DataCleanup] Database not configured, cleanup scheduler not started"
    );
    return;
  }

  if (cleanupInterval) {
    console.warn("[DataCleanup] Cleanup scheduler already running");
    return;
  }

  console.log(
    "[DataCleanup] Starting data cleanup scheduler (every 1 hour)..."
  );

  // Perform initial cleanup on start
  performCleanup();

  // Then cleanup every hour
  cleanupInterval = setInterval(performCleanup, CLEANUP_INTERVAL_MS);

  console.log("[DataCleanup] ✅ Data cleanup scheduler started");
}

/**
 * Stop the data cleanup scheduler
 */
export function stopDataCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log("[DataCleanup] Data cleanup scheduler stopped");
  }
}

/**
 * Manually trigger cleanup (for testing or admin purposes)
 * @returns {Promise<Object>} Cleanup result
 */
export async function manualCleanup() {
  console.log("[DataCleanup] Manual cleanup triggered");
  return performCleanup();
}

/**
 * Get cleanup scheduler status
 * @returns {Object} Status info
 */
export function getCleanupStatus() {
  return {
    isRunning: !!cleanupInterval,
    intervalMs: CLEANUP_INTERVAL_MS,
    retentionHours: DATA_RETENTION_HOURS,
  };
}
