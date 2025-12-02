// controllers/authController.js
import fetch from "node-fetch";
import { adminDb, adminAuth } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// REGISTER USER
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
    const usernameQuery = await adminDb
      .collection("users")
      .where("username", "==", username)
      .get();

    if (!usernameQuery.empty) {
      return errorResponse(
        res,
        "Username is already taken. Please try another.",
        400
      );
    }

    // Register via Identity Toolkit
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await resp.json();

    if (data.error) {
      if (data.error.message === "EMAIL_EXISTS") {
        return errorResponse(res, "Email is already registered.", 400);
      }
      return errorResponse(res, data.error.message, 400);
    }

    const uid = data.localId;

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, { role: userRole });

    // Simpan user ke Firestore
    const savedUserData = {
      uid,
      email,
      name,
      username,
      phone: noTelp || "",
      role: userRole,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };

    await adminDb.collection("users").doc(uid).set(savedUserData);

    // === SYSTEM LOGS ===
    await adminDb.collection("system_logs").add({
      action: "REGISTER_USER",
      targetUid: uid,
      payload: savedUserData, // apa yang disimpan
      firebaseResponse: data, // respon API Firebase
      timestamp: new Date().toISOString(),
    });

    return successResponse(res, { uid }, "Registration successful.", 201);
  } catch (error) {
    return errorResponse(res, `Registration failed: ${error.message}`, 500);
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return errorResponse(res, "Email and password are required.", 400);

  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const data = await resp.json();

    if (data.error) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const uid = data.localId;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists)
      return errorResponse(res, "User not found in database.", 404);

    const userData = userDoc.data();

    if (userData.isDeleted) {
      return errorResponse(
        res,
        "This account has been deleted. Please contact admin.",
        403
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(data.idToken, true);

    if (decodedToken.isDeleted === true) {
      return errorResponse(
        res,
        "This account has been deleted. Please contact admin.",
        403
      );
    }

    const roleFromToken = decodedToken.role || userData.role;

    const responseData = {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      uid,
      role: roleFromToken,
    };

    return successResponse(res, responseData, "Login successful.");
  } catch (error) {
    return errorResponse(res, `Login failed: ${error.message}`, 500);
  }
};
