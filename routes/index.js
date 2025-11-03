// routes/index.js
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import iotRoutes from "./iotRoutes.js";
import logsRoutes from "./logsRoutes.js";

const router = Router();

router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/iot", iotRoutes);
router.use("/logs", logsRoutes);

export default router;
