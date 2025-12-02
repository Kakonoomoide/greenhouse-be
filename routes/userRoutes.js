// routes/userRoutes.js
import { Router } from "express";
import {
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  changePassword,
  softDeleteUser,
} from "../controllers/userController.js";
import { checkAuth, checkIsAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/profile", checkAuth, getUserProfile);
router.put("/profile", checkAuth, updateUserProfile);
router.get("/admin/users", checkAuth, checkIsAdmin, getAllUsers);
router.delete("/admin/users/:uid", checkAuth, checkIsAdmin, softDeleteUser);
router.post("/profile/change-password", checkAuth, changePassword);

export default router;
