// controllers/userController.js
import { adminDb, adminAuth } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

/* -------------------------------------------------------------------------- */
/*                                🔧 Helpers                                   */
/* -------------------------------------------------------------------------- */

const getUserDoc = async (uid) => {
  const doc = await adminDb.collection("users").doc(uid).get();
  if (!doc.exists) return null;
  return doc.data();
};

const isUsernameTakenByOthers = async (username, uid) => {
  const snapshot = await adminDb
    .collection("users")
    .where("username", "==", username)
    .get();

  if (snapshot.empty) return false;

  const user = snapshot.docs[0].data();
  return user.uid !== uid;
};

const logSystemEvent = async (action, extra = {}) => {
  await adminDb.collection("system_logs").add({
    action,
    timestamp: new Date().toISOString(),
    ...extra,
  });
};

/* -------------------------------------------------------------------------- */
/*                          📌 GET USER PROFILE                                */
/* -------------------------------------------------------------------------- */

export const getUserProfile = async (req, res) => {
  try {
    const user = await getUserDoc(req.user.uid);

    if (!user) return errorResponse(res, "User not found.", 404);

    return successResponse(res, user, "Profile retrieved successfully.");
  } catch (error) {
    return errorResponse(res, `Failed to fetch profile: ${error.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                          📌 CHANGE PASSWORD                                 */
/* -------------------------------------------------------------------------- */

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
    await adminAuth.updateUser(uid, { password: newPassword });

    return successResponse(res, null, "Password changed successfully.");
  } catch (error) {
    return errorResponse(
      res,
      `Failed to change password: ${error.message}`,
      500
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                          📌 UPDATE USER PROFILE                              */
/* -------------------------------------------------------------------------- */

export const updateUserProfile = async (req, res) => {
  const { uid } = req.user;
  const { name, username, noTelp } = req.body;

  const dataToUpdate = {
    ...(name && { name }),
    ...(noTelp !== undefined && { phone: noTelp || "" }),
    ...(username && { username }),
  };

  if (Object.keys(dataToUpdate).length === 0) {
    return errorResponse(res, "No data provided for update.", 400);
  }

  try {
    if (username && (await isUsernameTakenByOthers(username, uid))) {
      return errorResponse(res, "Username is already taken.", 400);
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

/* -------------------------------------------------------------------------- */
/*                          📌 GET ALL USERS                                   */
/* -------------------------------------------------------------------------- */

export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await adminDb.collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return successResponse(res, users, "All users retrieved successfully.");
  } catch (error) {
    return errorResponse(res, `Failed to fetch users: ${error.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                         📌 SOFT DELETE USER                                 */
/* -------------------------------------------------------------------------- */

export const softDeleteUser = async (req, res) => {
  const { uid } = req.params;

  try {
    const userData = await getUserDoc(uid);
    if (!userData) return errorResponse(res, "User not found.", 404);

    if (userData.isDeleted) {
      return errorResponse(res, "User already deleted.", 400);
    }

    // SAVE TO deleted_users
    const timestamp = new Date().toISOString();
    const actorUid = req.user.uid;

    await adminDb
      .collection("deleted_users")
      .doc(uid)
      .set({
        ...userData,
        deletedAt: timestamp,
        deletedBy: actorUid,
      });

    // UPDATE ORIGINAL USER
    await adminDb.collection("users").doc(uid).update({
      isDeleted: true,
      deletedAt: timestamp,
    });

    // LOG
    await logSystemEvent("soft_delete_user", {
      targetUid: uid,
      actorUid,
      payload: {
        email: userData.email,
        name: userData.name,
        username: userData.username,
        phone: userData.phone || null,
        role: userData.role,
      },
    });

    return successResponse(res, null, "User soft deleted successfully.");
  } catch (error) {
    return errorResponse(res, `Failed to delete user: ${error.message}`, 500);
  }
};
