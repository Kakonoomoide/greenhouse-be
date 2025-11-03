// controllers/logController.js
import { adminDb } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

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
      return errorResponse(
        res,
        "No sensor data found for the last 7 days.",
        404
      );
    }

    const logs = [];
    snapshot.forEach((doc) => logs.push(doc.data()));

    return successResponse(
      res,
      logs,
      "Sensor data for the last 7 days retrieved successfully."
    );
  } catch (error) {
    return errorResponse(res, `Failed to retrieve data: ${error.message}`, 500);
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
      return errorResponse(res, "No audit log data found.", 404);
    }

    const logsPromises = snapshot.docs.map(async (doc) => {
      const logData = doc.data();
      const userId = logData.userId;

      const originalEmail = logData.username;
      delete logData.username;

      if (!userId) {
        logData.user = {
          email: originalEmail,
          name: "Unknown User",
        };
        return logData;
      }

      try {
        const userDoc = await adminDb.collection("users").doc(userId).get();

        if (userDoc.exists) {
          const userData = userDoc.data();

          logData.user = {
            email: userData.email || originalEmail,
            name: userData.name || null,
            phone: userData.phone || null,
            role: userData.role || null,
            username: userData.username || null,
          };
        } else {
          logData.user = {
            email: originalEmail,
            name: "User Not Found",
          };
        }
        return logData;
      } catch (userError) {
        console.error(
          `Failed to fetch user data for userId ${userId}:`,
          userError.message
        );
        logData.user = {
          email: originalEmail,
          name: "Error Fetching User",
        };
        return logData;
      }
    });
    const logs = await Promise.all(logsPromises);

    return successResponse(res, logs, "Audit log data retrieved successfully.");
    _;
  } catch (error) {
    return errorResponse(res, `Failed to retrieve data: ${error.message}`, 500);
  }
};
