// controllers/iotController.js
import { adminRtdb, adminDb } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

/* -------------------------------------------------------------------------- */
/*                                🔧 Helpers                                   */
/* -------------------------------------------------------------------------- */

// Helper: Ambil data dari RTDB
const readRtdb = async (path) => {
  const snapshot = await adminRtdb.ref(path).once("value");

  if (!snapshot.exists()) {
    throw new Error(`RTDB data not found at path: ${path}`);
  }

  return snapshot.val();
};

// Helper: Update config di RTDB
const updateConfig = async (path, value) => {
  await adminRtdb.ref(path).set(value);
};

// Helper: Tambah audit log
const addAuditLog = async (action, newValue, user) => {
  await adminDb.collection("audit_logs").add({
    action,
    newValue,
    userId: user.uid,
    username: user.name || user.email,
    timestamp: new Date().toISOString(),
  });
};

/* -------------------------------------------------------------------------- */
/*                          📌 Get IoT Status (/iot1)                          */
/* -------------------------------------------------------------------------- */

export const getIotStatus = async (req, res) => {
  try {
    const deviceKeys = ["iot1", "iot2", "iot3"];

    // Ambil semua device sekaligus
    const devicesArray = await Promise.all(
      deviceKeys.map((key) => readRtdb(`/${key}`))
    );

    const devices = Object.fromEntries(
      deviceKeys.map((key, index) => [key, devicesArray[index]])
    );

    const avg = (key) =>
      Number(
        (
          devicesArray.reduce((sum, d) => sum + (Number(d[key]) || 0), 0) /
          devicesArray.length
        ).toFixed(2)
      );

    const data = {
      devices,
      average: {
        temp: avg("temp"),
        humbd: avg("humbd"),
      },
    };

    return successResponse(res, data, "IoT data retrieved successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 404);
  }
};

/* -------------------------------------------------------------------------- */
/*                      📌 Get IoT Config (/iot1/config)                       */
/* -------------------------------------------------------------------------- */

export const getIotConfig = async (req, res) => {
  try {
    const config = await readRtdb("/iot1/config");

    return successResponse(res, config, "IoT config retrieved successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 404);
  }
};

/* -------------------------------------------------------------------------- */
/*                      📌 Update Max Temp (config/maxTemp)                    */
/* -------------------------------------------------------------------------- */

export const setMaxTemp = async (req, res) => {
  try {
    const { temp } = req.body;

    if (typeof temp !== "number") {
      return errorResponse(res, 'Request body must be { "temp": number }', 400);
    }

    await updateConfig("/iot1/config/maxTemp", temp);
    await addAuditLog("set_max_temp", temp, req.user);

    return successResponse(
      res,
      { maxTemp: temp },
      "Max temp updated successfully."
    );
  } catch (err) {
    return errorResponse(res, `Failed to update max temp: ${err.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                  📌 Update Automation Status (config/automation)            */
/* -------------------------------------------------------------------------- */

export const setAutomationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (typeof status !== "boolean") {
      return errorResponse(
        res,
        'Request body must be { "status": boolean }',
        400
      );
    }

    await updateConfig("/iot1/config/automation", status);
    await addAuditLog("set_automation_status", status, req.user);

    return successResponse(
      res,
      { automation: status },
      "Automation status updated successfully."
    );
  } catch (err) {
    return errorResponse(
      res,
      `Failed to update automation: ${err.message}`,
      500
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                    📌 Update Blower Status (config/blower)                  */
/* -------------------------------------------------------------------------- */

export const setBlowerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (typeof status !== "boolean") {
      return errorResponse(
        res,
        'Request body must be { "status": boolean }',
        400
      );
    }

    await updateConfig("/iot1/config/blower", status);
    await addAuditLog("set_blower_status", status, req.user);

    return successResponse(
      res,
      { blower: status },
      "Blower status updated successfully."
    );
  } catch (err) {
    return errorResponse(res, `Failed to update blower: ${err.message}`, 500);
  }
};

/* -------------------------------------------------------------------------- */
/*                   📌 IoT Logging endpoint (ESP32 → API)                    */
/* -------------------------------------------------------------------------- */

export const logBlowerEvent = async (req, res) => {
  try {
    const { status, trigger, temperature } = req.body;

    if (typeof status !== "boolean") {
      return errorResponse(res, 'Invalid "status": must be boolean', 400);
    }

    // Optional validation
    if (trigger && typeof trigger !== "string") {
      return errorResponse(res, '"trigger" must be a string', 400);
    }

    // Simpan ke Firestore
    await addAuditLog(
      "blower_event",
      { status, trigger, temperature },
      { uid: "iot_device", name: "IoT Device" }
    );

    return successResponse(res, {}, "Blower event logged.");
  } catch (err) {
    return errorResponse(
      res,
      `Failed to log blower event: ${err.message}`,
      500
    );
  }
};
