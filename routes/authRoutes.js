// routes/authRoutes.js
import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { checkAuth, checkSuperAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", checkAuth, checkSuperAdmin, registerUser);
router.post("/login", loginUser);

export default router;
