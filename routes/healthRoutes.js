// src/routes/healthRoutes.js
import { Router } from "express";
import dayjs from "dayjs";
import pkg from "../package.json" with { type: "json" };

const router = Router();
const API_VERSION = pkg.version;
const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");

router.get("/", (req, res) => {
  const uptimeInSec = process.uptime();
  res.json({
    status: "success",
    message: "🌱 Smart Farm IoT API is running! 🚀",
    version: API_VERSION,
    uptime: `${Math.floor(uptimeInSec)} seconds`,
    timestamp: timestamp,
    data: null,
  });
});

export default router;
