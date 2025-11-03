// routes/index.js
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import iotRoutes from "./iotRoutes.js";

const router = Router();

router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/iot", iotRoutes);

export default router;
