// routes/authRoutes.js
import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { checkAuth, checkIsAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", checkAuth, checkIsAdmin, registerUser);
router.post("/login", loginUser);

export default router;
