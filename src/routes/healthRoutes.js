/**
 * Health Check Routes
 */

import express from "express";
import { getHealth, getServerInfo } from "../controllers/healthController.js";

const router = express.Router();

// Health check endpoint
router.get("/health", getHealth);

// Root endpoint - server info
router.get("/", getServerInfo);

export default router;
