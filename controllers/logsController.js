// controllers/logs.controller.js
import { adminDb } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// Logic untuk BACA log sensor 7 hari
export const getSensorLogs = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await adminDb
      .collection("sensor_logs")
      .where("timestamp", ">=", sevenDaysAgo.toISOString())
      .orderBy("timestamp", "desc")
      .get();

    if (snapshot.empty) {
      return errorResponse(res, "Nggak ada data sensor 7 hari terakhir", 404);
    }

    const logs = [];
    snapshot.forEach((doc) => logs.push(doc.data()));

    return successResponse(res, logs, "Data sensor 7 hari berhasil diambil");
  } catch (error) {
    return errorResponse(res, `Gagal ambil data: ${error.message}`, 500);
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const snapshot = await adminDb
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    if (snapshot.empty) {
      return errorResponse(res, "Nggak ada data audit log", 404);
    }

    const logsPromises = snapshot.docs.map(async (doc) => {
      const logData = doc.data();
      const userId = logData.userId;

      if (!userId) {
        return logData;
      }

      try {
        const userDoc = await adminDb.collection("users").doc(userId).get();

        if (userDoc.exists()) {
          const userData = userDoc.data();

          logData.username =
            userData.name || userData.username || logData.username;
        }

        return logData;
      } catch (userError) {
        console.error(
          `Gagal fetch user data for userId ${userId}:`,
          userError.message
        );
        return logData;
      }
    });
    const logs = await Promise.all(logsPromises);

    return successResponse(res, logs, "Data audit log berhasil diambil");
  } catch (error) {
    return errorResponse(res, `Gagal ambil data: ${error.message}`, 500);
  }
};
