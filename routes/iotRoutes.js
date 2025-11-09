// routes/iotRoutes.js
import { Router } from "express";
import {
  getIotStatus,
  setAutomationStatus,
  setBlowerStatus,
  getIotConfig,
  setMaxTemp,
} from "../controllers/iotController.js";
import { checkAuth, checkIsAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// --- READ Endpoints (Bisa Super Admin / Admin Umum) ---
router.get("/status", checkAuth, getIotStatus);
router.get("/config", checkAuth, getIotConfig);

// --- WRITE Endpoints (Hanya Super Admin) ---
router.post("/automation", checkAuth, setAutomationStatus);
router.post("/blower", checkAuth, setBlowerStatus);
router.post("/maxtemp", checkAuth, checkIsAdmin, setMaxTemp);

export default router;
