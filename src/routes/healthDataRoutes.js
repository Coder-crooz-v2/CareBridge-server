/**
 * Health Data Routes
 * API endpoints for health data operations
 */

import express from "express";
import {
  getUserHealthData,
  getSystemStatus,
  triggerCleanup,
} from "../controllers/healthDataController.js";

const router = express.Router();

// Get system status (generator, cleanup, stats)
router.get("/status", getSystemStatus);

// Get health data for a specific user
router.get("/:userId", getUserHealthData);

// Manually trigger data cleanup
router.post("/cleanup", triggerCleanup);

export default router;
