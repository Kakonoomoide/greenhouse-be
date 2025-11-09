// middleware/auth.middleware.js

import { adminAuth } from "../lib/firebaseAdmin.js";

// Cek kalo user udah login (token valid)
export const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid Authorization token." });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid or expired token.", error: error.message });
  }
};

// Cek kalo user adalah Admin
export const checkIsAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }
  next();
};
