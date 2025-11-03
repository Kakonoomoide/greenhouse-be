// routes/index.js
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/", authRoutes);
router.use("/", userRoutes);

export default router;
