// controllers/iot.controller.js
import { adminRtdb } from "../lib/firebaseAdmin.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// Logic untuk BACA status sensor (dari path /iot1)
export const getIotStatus = async (req, res) => {
  try {
    const snapshot = await adminRtdb.ref("/iot1").once("value");

    if (!snapshot.exists()) {
      return errorResponse(res, "Data IoT tidak ditemukan di path /iot1", 404);
    }
    // isinya: { temp: 28, humbd: 80, hic: 32 }
    return successResponse(res, snapshot.val(), "Data IoT berhasil diambil");
  } catch (error) {
    return errorResponse(res, `Gagal ambil data: ${error.message}`, 500);
  }
};


// Logic untuk BACA SEMUA CONFIG (automation, blower, maxTemp)
export const getIotConfig = async (req, res) => {
  try {
    const snapshot = await adminRtdb.ref("/iot1/config").once("value");

    if (!snapshot.exists()) {
      return errorResponse(res, "Data config IoT tidak ditemukan", 404);
    }
    // isinya: { automation: true, blower: false, maxTemp: 30 }
    return successResponse(res, snapshot.val(), "Config IoT berhasil diambil");
  } catch (error) {
    return errorResponse(res, `Gagal ambil config: ${error.message}`, 500);
  }
};

// Logic untuk SET maxTemp (Super Admin)
export const setMaxTemp = async (req, res) => {
  try {
    const { temp } = req.body; // Expect { "temp": 30 }

    if (typeof temp !== "number") {
      return errorResponse(
        res,
        'Body request harus { "temp": (angka) }',
        400
      );
    }

    // Tulis data ke path config
    await adminRtdb.ref("/iot1/config/maxTemp").set(temp);

    return successResponse(
      res,
      { maxTemp: temp },
      "Max temp berhasil di-update"
    );
  } catch (error) {
    return errorResponse(res, `Gagal update max temp: ${error.message}`, 500);
  }
};
// --- END: TAMBAHAN BARU ---

// Logic untuk SET status automation (Super Admin)
export const setAutomationStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expect { "status": true } or { "status": false }

    if (typeof status !== "boolean") {
      return errorResponse(
        res,
        'Body request harus { "status": true/false }',
        400
      );
    }

    await adminRtdb.ref("/iot1/config/automation").set(status);

    return successResponse(
      res,
      { automation: status },
      "Status automation berhasil di-update"
    );
  } catch (error) {
    return errorResponse(res, `Gagal update automation: ${error.message}`, 500);
  }
};

// Logic untuk SET status blower (Super Admin)
export const setBlowerStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expect { "status": true } or { "status": false }

    if (typeof status !== "boolean") {
      return errorResponse(
        res,
        'Body request harus { "status": true/false }',
        400
      );
    }

    await adminRtdb.ref("/iot1/config/blower").set(status);

    return successResponse(
      res,
      { blower: status },
      "Status blower berhasil di-update"
    );
  } catch (error) {
    return errorResponse(res, `Gagal update blower: ${error.message}`, 500);
  }
};