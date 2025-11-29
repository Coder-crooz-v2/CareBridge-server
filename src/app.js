/**
 * Express Application Setup
 */

import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import healthRoutes from "./routes/healthRoutes.js";
import healthDataRoutes from "./routes/healthDataRoutes.js";

const app = express();

// Configure CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Register routes
app.use("/", healthRoutes);
app.use("/api/health-data", healthDataRoutes);

export default app;
