// src/routes/healthRoutes.js
import { Router } from "express";

const router = Router();
const API_VERSION = "1.1.1"; // Bisa ambil dari versioning.js/json

router.get("/", (req, res) => {
  const uptimeInSec = process.uptime();
  res.json({
    status: "success",
    message: "🌱 Smart Farm IoT API is running! 🚀",
    version: API_VERSION,
    uptime: `${Math.floor(uptimeInSec)} seconds`,
    timestamp: new Date().toISOString(),
    data: null,
  });
});

export default router;
