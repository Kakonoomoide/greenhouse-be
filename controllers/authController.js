// controllers/authController.js
import fetch from "node-fetch";
import { adminDb, adminAuth } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

/* -------------------------------------------------------------------------- */
/*                                 🔧 Helpers                                  */
/* -------------------------------------------------------------------------- */

// Firebase Identity Toolkit wrapper
const firebaseAuthRequest = async (url, body) => {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json();

  if (data.error) throw new Error(data.error.message);

  return data;
};

// Check unique username
const isUsernameTaken = async (username) => {
  const snapshot = await adminDb
    .collection("users")
    .where("username", "==", username)
    .get();

  return !snapshot.empty;
};

// Save new user to Firestore
const saveUserToFirestore = async (uid, payload) => {
  await adminDb.collection("users").doc(uid).set(payload);
};

// Add system log
const logSystemEvent = async (action, extra = {}) => {
  await adminDb.collection("system_logs").add({
    action,
    timestamp: new Date().toISOString(),
    ...extra,
  });
};

/* -------------------------------------------------------------------------- */
/*                              📌 REGISTER USER                               */
/* -------------------------------------------------------------------------- */

export const registerUser = async (req, res) => {
  const { email, password, name, role, username, noTelp } = req.body;

  if (!email || !password || !name || !username) {
    return errorResponse(
      res,
      "Email, password, name, and username are required.",
      400
    );
  }

  const userRole = role === "admin" ? "admin" : "farmer";

  try {
    // Cek username unik
    if (await isUsernameTaken(username)) {
      return errorResponse(
        res,
        "Username is already taken. Please try another.",
        400
      );
    }

    // REGISTER FIREBASE AUTH
    let data;
    try {
      data = await firebaseAuthRequest(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
        { email, password, returnSecureToken: true }
      );
    } catch (err) {
      if (err.message === "EMAIL_EXISTS") {
        return errorResponse(res, "Email is already registered.", 400);
      }
      return errorResponse(res, err.message, 400);
    }

    const uid = data.localId;

    // SET CUSTOM CLAIMS
    await adminAuth.setCustomUserClaims(uid, { role: userRole });

    // SAVE USER TO FIRESTORE
    const userPayload = {
      uid,
      email,
      name,
      username,
      phone: noTelp || "",
      role: userRole,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };

    await saveUserToFirestore(uid, userPayload);

    // SYSTEM LOG
    await logSystemEvent("register_user", {
      targetUid: uid,
      payload: userPayload,
      firebaseResponse: data,
    });

    return successResponse(res, { uid }, "Registration successful.", 201);
  } catch (error) {
    return errorResponse(res, `Registration failed: ${error.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                                 📌 LOGIN USER                               */
/* -------------------------------------------------------------------------- */

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return errorResponse(res, "Email and password are required.", 400);

  try {
    // AUTHENTICATE
    let data;
    try {
      data = await firebaseAuthRequest(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        { email, password, returnSecureToken: true }
      );
    } catch (err) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const uid = data.localId;

    // LOAD USER DATA
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists)
      return errorResponse(res, "User not found in database.", 404);

    const userData = userDoc.data();

    if (userData.isDeleted)
      return errorResponse(
        res,
        "This account has been deleted. Please contact admin.",
        403
      );

    // VERIFY TOKEN & CHECK CLAIM DELETION
    const decodedToken = await adminAuth.verifyIdToken(data.idToken, true);

    if (decodedToken.isDeleted === true) {
      return errorResponse(
        res,
        "This account has been deleted. Please contact admin.",
        403
      );
    }

    const role = decodedToken.role || userData.role;

    return successResponse(
      res,
      {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        uid,
        role,
      },
      "Login successful."
    );
  } catch (error) {
    return errorResponse(res, `Login failed: ${error.message}`, 500);
  }
};
