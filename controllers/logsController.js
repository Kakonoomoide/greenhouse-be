// controllers/logController.js
import { adminDb, adminRtdb } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

/* -------------------------------------------------------------------------- */
/*                         🔧 Utility Helper Functions                        */
/* -------------------------------------------------------------------------- */

// Ambil user dari Firestore dan format
const getUserData = async (userId, fallbackEmail) => {
  if (!userId) {
    return {
      email: fallbackEmail,
      name: "Unknown User",
    };
  }

  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        email: fallbackEmail,
        name: "User Not Found",
      };
    }

    const data = userDoc.data();
    return {
      email: data.email || fallbackEmail,
      name: data.name || null,
      phone: data.phone || null,
      role: data.role || null,
      username: data.username || null,
    };
  } catch (err) {
    console.error(`Failed to load user ${userId}:`, err.message);
    return {
      email: fallbackEmail,
      name: "Error Fetching User",
    };
  }
};

// Ambil actor user untuk system_logs
const getActorData = async (actorUid) => {
  if (!actorUid) {
    return {
      uid: null,
      name: "Unknown Actor",
      email: null,
      role: null,
    };
  }

  try {
    const userDoc = await adminDb.collection("users").doc(actorUid).get();
    if (!userDoc.exists) {
      return {
        uid: actorUid,
        name: "User Not Found",
        email: null,
        role: null,
      };
    }

    const u = userDoc.data();
    return {
      uid: actorUid,
      name: u.name || null,
      email: u.email || null,
      role: u.role || null,
      username: u.username || null,
    };
  } catch (err) {
    console.error("Actor fetch error:", err.message);
    return {
      uid: actorUid,
      name: "Error Fetching User",
      email: null,
      role: null,
    };
  }
};

/* -------------------------------------------------------------------------- */
/*                             📌 GET SENSOR LOGS                              */
/* -------------------------------------------------------------------------- */

export const getSensorLogs = async (req, res) => {
  try {
    const now = new Date();
    const logs = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);

      const docRef = adminDb.collection("sensor_logs").doc(dateString);
      const doc = await docRef.get();

      if (doc.exists) {
        logs.push(doc.data());
      }
    }

    if (logs.length === 0) {
      return errorResponse(
        res,
        "No sensor data found for the last 7 days.",
        404
      );
    }

    return successResponse(res, logs, "Sensor logs retrieved successfully.");
  } catch (error) {
    return errorResponse(res, `Failed to retrieve data: ${error.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                             📌 RECORD SENSOR LOG                             */
/* -------------------------------------------------------------------------- */

export const recordSensorLog = async (req, res) => {
  try {
    // Security check
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return errorResponse(res, "Unauthorized request", 401);
    }

    const data = (await adminRtdb.ref("/iot1").once("value")).val();
    if (!data) return errorResponse(res, "No IoT data found in RTDB", 404);

    const currentTemp = data.temp || 0;
    const currentHumid = data.humbd || 0;

    const now = new Date();
    const docId = now.toISOString().split("T")[0];

    const logRef = adminDb.collection("sensor_logs").doc(docId);
    const existingDoc = await logRef.get();

    const existing = existingDoc.exists ? existingDoc.data() : {};

    const finalTemp = Math.max(currentTemp, existing.temp || 0);
    const finalHumid = Math.max(currentHumid, existing.humidity || 0);

    await logRef.set(
      {
        temp: finalTemp,
        humidity: finalHumid,
        lastUpdated: now.toISOString(),
        createdAt: existing.createdAt || now,
        docId,
      },
      { merge: true }
    );

    // Delete older than 14 days
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const oldLogsSnapshot = await adminDb
      .collection("sensor_logs")
      .where("createdAt", "<", twoWeeksAgo)
      .get();

    if (!oldLogsSnapshot.empty) {
      const batch = adminDb.batch();
      oldLogsSnapshot.forEach(
        (doc) => doc.id !== docId && batch.delete(doc.ref)
      );
      await batch.commit();
    }

    return successResponse(
      res,
      {
        docId,
        savedData: {
          maxTempToday: finalTemp,
          maxHumidToday: finalHumid,
          currentScan: { temp: currentTemp, humidity: currentHumid },
        },
        deletedCount: oldLogsSnapshot.size,
      },
      "Cron job executed: Updated daily max values."
    );
  } catch (error) {
    console.error("Cron Error:", error);
    return errorResponse(res, `Cron job failed: ${error.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                              📌 GET AUDIT LOGS                               */
/* -------------------------------------------------------------------------- */

export const getAuditLogs = async (req, res) => {
  try {
    const snapshot = await adminDb
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    if (snapshot.empty)
      return errorResponse(res, "No audit log data found.", 404);

    const logs = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const originalEmail = data.username;
        delete data.username;

        data.user = await getUserData(data.userId, originalEmail);
        return data;
      })
    );

    return successResponse(res, logs, "Audit log data retrieved successfully.");
  } catch (error) {
    return errorResponse(res, `Failed to retrieve data: ${error.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                            📌 GET SYSTEM LOGS                                */
/* -------------------------------------------------------------------------- */

export const getSystemLogs = async (req, res) => {
  try {
    const limitCount = parseInt(req.query.limit) || 50;

    const snapshot = await adminDb
      .collection("system_logs")
      .orderBy("timestamp", "desc")
      .limit(limitCount)
      .get();

    if (snapshot.empty)
      return errorResponse(res, "No system log data found.", 404);

    const logs = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        const actorUid = data.actorUid || data.deletedBy || data.createdBy;

        delete data.deletedBy;
        delete data.createdBy;

        data.actor = await getActorData(actorUid);
        return data;
      })
    );

    return successResponse(
      res,
      logs,
      "System log data retrieved successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      `Failed to retrieve system logs: ${error.message}`,
      500
    );
  }
};
