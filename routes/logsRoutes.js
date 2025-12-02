// routes/logsRoutes.js
import { Router } from "express";
import {
  getSensorLogs,
  getAuditLogs,
  getSystemLogs,
} from "../controllers/logsController.js";
import { checkAuth, checkIsAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/sensor-logs", checkAuth, getSensorLogs);
router.get("/audit-logs", checkAuth, getAuditLogs);
router.get("/system-logs", checkAuth, checkIsAdmin, getSystemLogs);

export default router;
