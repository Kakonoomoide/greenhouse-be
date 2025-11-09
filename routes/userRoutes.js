// routes/userRoutes.js
import { Router } from "express";
import {
  getUserProfile,
  getAdminUsers,
  updateUserProfile,
  changePassword,
} from "../controllers/userController.js";
import { checkAuth, checkIsAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/profile", checkAuth, getUserProfile);
router.put("/profile", checkAuth, updateUserProfile);
router.get("/admin/users", checkAuth, checkIsAdmin, getAdminUsers);
router.post("/profile/change-password", checkAuth, changePassword);

export default router;
