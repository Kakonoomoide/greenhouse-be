// controllers/user.controller.js
import { adminDb } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// Logic untuk ambil profile
export const getUserProfile = async (req, res) => {
  try {
    const userDocRef = adminDb.collection("users").doc(req.user.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) return errorResponse(res, "User tidak ditemukan", 404);

    return successResponse(res, userDoc.data(), "Profile berhasil diambil");
  } catch (error) {
    return errorResponse(res, `Gagal fetch profile: ${error.message}`, 500);
  }
};

// Logic untuk admin
export const getAdminUsers = (req, res) => {
  const data = {
    message: "Welcome, Super Admin. Ini data semua user.",
    currentUser: req.user,
  };
  return successResponse(res, data, "Data admin berhasil diambil");
};
