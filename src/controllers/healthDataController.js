/**
 * Health Data Controller
 * Handles HTTP endpoints for health data operations
 */

import {
  getHealthDataByUser,
  getHealthDataCount,
} from "../models/healthDataModel.js";
import { getGeneratorStatus } from "../services/healthDataGeneratorService.js";
import {
  getCleanupStatus,
  manualCleanup,
} from "../services/dataCleanupService.js";
import { getUserCount } from "../models/userModel.js";
import { isDatabaseEnabled } from "../config/database.js";

/**
 * Get health data for a specific user
 * GET /api/health-data/:userId
 */
export async function getUserHealthData(req, res) {
  try {
    if (!isDatabaseEnabled()) {
      return res.status(503).json({
        error: "Database not configured",
      });
    }

    const { userId } = req.params;
    const { hours = 1 } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    const data = await getHealthDataByUser(userId, parseInt(hours));

    res.json({
      userId,
      recordCount: data.length,
      timeRangeHours: parseInt(hours),
      data,
    });
  } catch (error) {
    console.error(
      "[HealthDataController] Error fetching user health data:",
      error
    );
    res.status(500).json({
      error: "Failed to fetch health data",
      message: error.message,
    });
  }
}

/**
 * Get system status including generator and cleanup status
 * GET /api/health-data/status
 */
export async function getSystemStatus(req, res) {
  try {
    const generatorStatus = getGeneratorStatus();
    const cleanupStatus = getCleanupStatus();

    let userCount = 0;
    let recordCount = 0;

    if (isDatabaseEnabled()) {
      try {
        userCount = await getUserCount();
        recordCount = await getHealthDataCount();
      } catch (error) {
        console.error("[HealthDataController] Error fetching counts:", error);
      }
    }

    res.json({
      databaseEnabled: isDatabaseEnabled(),
      generator: generatorStatus,
      cleanup: cleanupStatus,
      stats: {
        registeredUsers: userCount,
        healthDataRecords: recordCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "[HealthDataController] Error fetching system status:",
      error
    );
    res.status(500).json({
      error: "Failed to fetch system status",
      message: error.message,
    });
  }
}

/**
 * Manually trigger data cleanup
 * POST /api/health-data/cleanup
 */
export async function triggerCleanup(req, res) {
  try {
    if (!isDatabaseEnabled()) {
      return res.status(503).json({
        error: "Database not configured",
      });
    }

    const result = await manualCleanup();

    res.json({
      success: true,
      message: "Cleanup completed successfully",
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[HealthDataController] Error triggering cleanup:", error);
    res.status(500).json({
      error: "Failed to trigger cleanup",
      message: error.message,
    });
  }
}
