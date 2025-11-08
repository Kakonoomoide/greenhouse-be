// controllers/authController.js
import fetch from "node-fetch";
import { adminDb, adminAuth } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

export const registerUser = async (req, res) => {
  const { email, password, name, role, username, noTelp } = req.body;

  if (!email || !password || !name || !username) {
    return errorResponse(
      res,
      "Email, password, name, and username are required.",
      400
    );
  }

  const userRole = role === "superAdmin" ? "superAdmin" : "admin";

  try {
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

    await adminAuth.setCustomUserClaims(data.localId, { role: userRole });

    await adminDb
      .collection("users")
      .doc(data.localId)
      .set({
        uid: data.localId,
        email: email,
        name: name,
        username: username,
        phone: noTelp || "",
        role: userRole,
        createdAt: new Date().toISOString(),
      });

    return successResponse(
      res,
      { uid: data.localId },
      "Registration successful.",
      201
    );
  } catch (error) {
    return errorResponse(res, `Registration failed: ${error.message}`, 500);
  }
};

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

    const userRecord = await adminDb
      .collection("users")
      .doc(data.localId)
      .get();
    const userData = userRecord.data();

    if (!userData || !userData.role) {
      return errorResponse(res, "User role not found.", 404);
    }

    const responseData = {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      uid: data.localId,
      role: userData.role,
    };
    return successResponse(res, responseData, "Login successful.");
  } catch (error) {
    return errorResponse(res, `Login failed: ${error.message}`, 500);
  }
};
