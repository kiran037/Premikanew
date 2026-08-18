import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import storefrontRoutes from "@/routes/storefront.routes";
import adminRoutes from "@/routes/admin.routes";
import { errorHandler } from "@/middleware/errorHandler.middleware";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Body parsers & Cookie parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health Check Endpoint
app.get("/health", async (req, res) => {
  let dbStatus = "connected";
  try {
    await db.execute(sql`SELECT 1`);
  } catch (err) {
    dbStatus = "disconnected";
  }

  return res.status(200).json({
    status: "ok",
    service: "premika-backend",
    version: "1.0.0",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api", storefrontRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Premika Standalone Backend Running`);
  console.log(` Port:        http://localhost:${PORT}`);
  console.log(` Health:      http://localhost:${PORT}/health`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`==================================================`);
});

export default app;
