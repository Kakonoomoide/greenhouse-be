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

// Ganti Password
export const changePassword = async (req, res) => {
  const { uid } = req.user;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return errorResponse(res, "Password baru minimal 6 karakter", 400);
  }

  try {
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return successResponse(res, null, "Password berhasil diubah");
  } catch (error) {
    return errorResponse(res, `Gagal ubah password: ${error.message}`, 500);
  }
};

// Edit Profile
export const updateUserProfile = async (req, res) => {
  const { uid } = req.user; // UID dari user yang lagi login
  const { name, username, noTelp } = req.body;

  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (noTelp !== undefined) dataToUpdate.phone = noTelp || "";
  if (username) dataToUpdate.username = username;

  if (Object.keys(dataToUpdate).length === 0) {
    return errorResponse(res, "Nggak ada data buat di-update", 400);
  }

  try {
    // Kalo user ganti username, cek duplikat
    if (username) {
      const usernameQuery = await adminDb
        .collection("users")
        .where("username", "==", username)
        .get();

      if (!usernameQuery.empty) {
        const existingUser = usernameQuery.docs[0].data();
        // Cek kalo username itu dipake orang lain
        if (existingUser.uid !== uid) {
          return errorResponse(res, "Username sudah dipakai, bro", 400);
        }
      }
    }

    // Update data di Firestore
    await adminDb.collection("users").doc(uid).update(dataToUpdate);

    return successResponse(res, dataToUpdate, "Profile berhasil di-update");
  } catch (error) {
    return errorResponse(res, `Gagal update profile: ${error.message}`, 500);
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
