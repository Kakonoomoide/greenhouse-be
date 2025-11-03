// controllers/userController.js
import { adminDb, adminAuth } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

export const getUserProfile = async (req, res) => {
  try {
    const userDocRef = adminDb.collection("users").doc(req.user.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) return errorResponse(res, "User not found.", 404);

    return successResponse(
      res,
      userDoc.data(),
      "Profile retrieved successfully."
    );
  } catch (error) {
    return errorResponse(res, `Failed to fetch profile: ${error.message}`, 500);
  }
};

export const changePassword = async (req, res) => {
  const { uid } = req.user;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return errorResponse(
      res,
      "New password must be at least 6 characters.",
      400
    );
  }

  try {
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return successResponse(res, null, "Password changed successfully.");
  } catch (error) {
    return errorResponse(
      res,
      `Failed to change password: ${error.message}`,
      500
    );
  }
};

export const updateUserProfile = async (req, res) => {
  const { uid } = req.user;
  const { name, username, noTelp } = req.body;

  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (noTelp !== undefined) dataToUpdate.phone = noTelp || "";
  if (username) dataToUpdate.username = username;

  if (Object.keys(dataToUpdate).length === 0) {
    return errorResponse(res, "No data provided for update.", 400);
  }

  try {
    if (username) {
      const usernameQuery = await adminDb
        .collection("users")
        .where("username", "==", username)
        .get();

      if (!usernameQuery.empty) {
        const existingUser = usernameQuery.docs[0].data();
        if (existingUser.uid !== uid) {
          return errorResponse(res, "Username is already taken.", 400);
        }
      }
    }

    await adminDb.collection("users").doc(uid).update(dataToUpdate);

    return successResponse(res, dataToUpdate, "Profile updated successfully.");
  } catch (error) {
    return errorResponse(
      res,
      `Failed to update profile: ${error.message}`,
      500
    );
  }
};

export const getAdminUsers = (req, res) => {
  const data = {
    message: "Welcome, Super Admin. This is all user data.",
    currentUser: req.user,
  };
  return successResponse(res, data, "Admin data retrieved successfully.");
};
