// routes/user.routes.js
import { Router } from "express";
import {
  getUserProfile,
  getAdminUsers,
} from "../controllers/userController.js";
import { checkAuth, checkSuperAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/profile", checkAuth, getUserProfile);
router.get("/admin/users", checkAuth, checkSuperAdmin, getAdminUsers);

export default router;
