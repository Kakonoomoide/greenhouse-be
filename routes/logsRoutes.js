// routes/logsRoutes.js
import { Router } from "express";
import { getSensorLogs, getAuditLogs } from "../controllers/logsController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/sensor-logs", checkAuth, getSensorLogs);
router.get("/audit-logs", checkAuth, getAuditLogs);

export default router;
