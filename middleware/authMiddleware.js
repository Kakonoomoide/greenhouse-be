// middleware/auth.middleware.js
import { adminAuth, adminDb } from "../lib/firebaseAdmin.js";

/* -------------------------------------------------------------------------- */
/*                                🔧 Helpers                                   */
/* -------------------------------------------------------------------------- */

const sendError = (res, status, message) =>
  res.status(status).json({ message });

const getUserFromDb = async (uid) => {
  const doc = await adminDb.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
};

const isUserDeleted = (token, userDb) => {
  return token?.isDeleted === true || userDb?.isDeleted === true;
};

/* -------------------------------------------------------------------------- */
/*                          📌 CHECK AUTH (TOKEN VALID)                        */
/* -------------------------------------------------------------------------- */

export const checkAuth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, 401, "Missing or invalid Authorization token.");
  }

  const token = header.split(" ")[1];

  try {
    // VERIFY ID TOKEN
    const decoded = await adminAuth.verifyIdToken(token, true);
    req.user = decoded;

    // GET USER RECORD FROM FIRESTORE
    const userDb = await getUserFromDb(decoded.uid);

    // CHECK SOFT DELETE (token.claims atau Firestore)
    if (isUserDeleted(decoded, userDb)) {
      return sendError(
        res,
        403,
        "Account has been deleted. Please contact admin."
      );
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                          📌 CHECK IS ADMIN                                   */
/* -------------------------------------------------------------------------- */

export const checkIsAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return sendError(res, 403, "Access denied. Admin privileges required.");
  }
  next();
};
