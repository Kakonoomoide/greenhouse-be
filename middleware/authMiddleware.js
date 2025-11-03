// middleware/auth.middleware.js

import { adminAuth } from "../lib/firebaseAdmin.js";

// Cek kalo user udah login (token valid)
export const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token-nya mana?" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token-nya invalid, bro", error: error.message });
  }
};

// Cek kalo user adalah Super Admin
export const checkSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superAdmin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Only for Super Admin." });
  }
  next();
};
