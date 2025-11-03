// controllers/auth.controller.js
import fetch from "node-fetch";
import { adminDb, adminAuth } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// Logic untuk Register
export const registerUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password)
    return errorResponse(res, "Email dan password wajib diisi", 400);

  const userRole = role === "superAdmin" ? "superAdmin" : "adminUmum";

  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await resp.json();
    if (data.error) return errorResponse(res, data.error.message, 400);

    await adminAuth.setCustomUserClaims(data.localId, { role: userRole });

    await adminDb
      .collection("users")
      .doc(data.localId)
      .set({
        uid: data.localId,
        email,
        name: name || "",
        role: userRole,
        createdAt: new Date().toISOString(),
      });

    return successResponse(
      res,
      { uid: data.localId },
      "Registrasi berhasil",
      201
    );
  } catch (error) {
    return errorResponse(res, `Gagal register: ${error.message}`, 500);
  }
};

// Logic untuk Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return errorResponse(res, "Email dan password wajib diisi", 400);

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
      return errorResponse(res, "Email atau password salah", 401);
    }

    const responseData = {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      uid: data.localId,
    };
    return successResponse(res, responseData, "Login berhasil");
  } catch (error) {
    return errorResponse(res, `Login gagal: ${error.message}`, 500);
  }
};
