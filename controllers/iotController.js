// controllers/iotController.js
import { adminRtdb, adminDb } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// Logic untuk BACA status sensor (dari path /iot1)
export const getIotStatus = async (req, res) => {
  try {
    const snapshot = await adminRtdb.ref("/iot1").once("value");

    if (!snapshot.exists()) {
      return errorResponse(res, "IoT data not found at path /iot1", 404);
    }
    return successResponse(
      res,
      snapshot.val(),
      "IoT data retrieved successfully."
    );
  } catch (error) {
    return errorResponse(res, `Failed to retrieve data: ${error.message}`, 500);
  }
};

// Logic untuk BACA SEMUA CONFIG (automation, blower, maxTemp)
export const getIotConfig = async (req, res) => {
  try {
    const snapshot = await adminRtdb.ref("/iot1/config").once("value");

    if (!snapshot.exists()) {
      return errorResponse(res, "IoT config data not found.", 404);
    }
    return successResponse(
      res,
      snapshot.val(),
      "IoT config retrieved successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      `Failed to retrieve config: ${error.message}`,
      500
    );
  }
};

export const setMaxTemp = async (req, res) => {
  try {
    const { temp } = req.body;
    if (typeof temp !== "number") {
      return errorResponse(
        res,
        'Request body must be { "temp": (number) }',
        400
      );
    }

    await adminRtdb.ref("/iot1/config/maxTemp").set(temp);

    await adminDb.collection("audit_logs").add({
      action: "set_max_temp",
      newValue: temp,
      userId: req.user.uid,
      username: req.user.name || req.user.email,
      timestamp: new Date().toISOString(),
    });

    return successResponse(
      res,
      { maxTemp: temp },
      "Max temp updated successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      `Failed to update max temp: ${error.message}`,
      500
    );
  }
};

export const setAutomationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (typeof status !== "boolean") {
      return errorResponse(
        res,
        'Request body must be { "status": true/false }',
        400
      );
    }

    await adminRtdb.ref("/iot1/config/automation").set(status);

    await adminDb.collection("audit_logs").add({
      action: "set_automation_status",
      newValue: status,
      userId: req.user.uid,
      username: req.user.name || req.user.email,
      timestamp: new Date().toISOString(),
    });

    return successResponse(
      res,
      { automation: status },
      "Automation status updated successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      `Failed to update automation: ${error.message}`,
      500
    );
  }
};

export const setBlowerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (typeof status !== "boolean") {
      return errorResponse(
        res,
        'Request body must be { "status": true/false }',
        400
      );
    }

    await adminRtdb.ref("/iot1/config/blower").set(status);

    await adminDb.collection("audit_logs").add({
      action: "set_blower_status",
      newValue: status,
      userId: req.user.uid,
      username: req.user.name || req.user.email,
      timestamp: new Date().toISOString(),
    });

    return successResponse(
      res,
      { blower: status },
      "Blower status updated successfully."
    );
  } catch (error) {
    return errorResponse(res, `Failed to update blower: ${error.message}`, 500);
  }
};
