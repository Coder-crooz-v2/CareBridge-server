/**
 * Express Application Setup
 */

import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();

// Configure CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Register routes
app.use("/", healthRoutes);

export default app;
