// routes/iot.routes.js
import { Router } from "express";
import {
  getIotStatus,
  setAutomationStatus,
  setBlowerStatus,
  getIotConfig,
  setMaxTemp,
} from "../controllers/iotController.js";
import { checkAuth, checkSuperAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// --- READ Endpoints (Bisa Super Admin / Admin Umum) ---
router.get("/status", checkAuth, getIotStatus);
router.get("/config", checkAuth, getIotConfig);

// --- WRITE Endpoints (Hanya Super Admin) ---
router.post("/automation", checkAuth, checkSuperAdmin, setAutomationStatus);
router.post("/blower", checkAuth, checkSuperAdmin, setBlowerStatus);
router.post("/maxtemp", checkAuth, checkSuperAdmin, setMaxTemp); // <-- ROUTE BARU

export default router;