# 🚀 API Documentation (Smart Farm IoT)

## 📌 General Info

### Base URL
* **Development:** `http://localhost:6868/api`
* **Production:** `https://api.yourdomain.com/api`

### 🔑 Authentication
Sebagian besar endpoint butuh **Header Authorization**.
* **Header:** `Authorization`
* **Value:** `Bearer <idToken_firebase>`

---

## ⚙️ System Endpoints

### `GET /`
> Health check server status.

* **Access:** Public
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Smart Farm IoT API is running...",
      "data": null
    }
    ```

---

## 🔐 Auth Endpoints

### `POST /login`
> Login user/admin untuk mendapatkan token.

* **Body:**
    ```json
    { "email": "admin@example.com", "password": "..." }
    ```
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Login successful.",
      "data": {
        "idToken": "eyJhbGciOi...",
        "uid": "rQdEDrYa9LPnApJFOexUPYM55Kl1"
      }
    }
    ```

### `POST /register`
> Register user baru (Admin/Farmer).

* **Access:** Super Admin only
* **Body:**
    ```json
    {
      "email": "newuser@example.com",
      "password": "password123",
      "name": "User Baru",
      "username": "user_baru",
      "role": "admin",
      "noTelp": "08123456789"
    }
    ```
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Registration successful.",
      "data": { "uid": "xYzAaBbCc..." }
    }
    ```

---

## 👤 Profile & User Management

### `GET /profile`
> Ambil data diri user yang sedang login.

* **Access:** Any Authenticated User
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Profile retrieved successfully.",
      "data": {
        "uid": "lY2hvov3...",
        "email": "admin@greenhouse.com",
        "name": "Admin Ganteng",
        "role": "admin"
      }
    }
    ```

### `PUT /profile`
> Update profile user.

* **Access:** Any Authenticated User
* **Body:** `{ "name": "Admin Baru" }`
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Profile updated successfully.",
      "data": { "name": "Admin Baru" }
    }
    ```

### `POST /profile/change-password`
> Ganti password user.

* **Body:** `{ "newPassword": "rahasia banget" }`
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Password changed successfully.",
      "data": null
    }
    ```

### `GET /admin/users`
> Ambil semua daftar user.

* **Access:** Admin / Super Admin
* **Response:**
    ```json
    {
      "status": "success",
      "message": "All users retrieved successfully.",
      "data": [
        {
          "uid": "ZCJFHh1Up...",
          "email": "farmer@greenhouse.com",
          "name": "Pak Tani",
          "role": "farmer"
        },
        {
          "uid": "lY2hvov3...",
          "email": "admin@greenhouse.com",
          "name": "Admin Pusat",
          "role": "admin"
        }
      ]
    }
    ```

### `DELETE /admin/users/:uid`
> Soft delete user (Menonaktifkan user).

* **Access:** Admin / Super Admin
* **Params:** `uid` (ID user yang mau dihapus)
* **Response:**
    ```json
    {
      "status": "success",
      "message": "User soft deleted successfully.",
      "data": null
    }
    ```

---

## ⚡ IoT Control

### `GET /iot/status`
> Ambil semua data sensor & config.

* **Response:**
    ```json
    {
      "status": "success",
      "data": {
        "sensor": { "temp": 28.5, "humidity": 70 },
        "config": { "automation": true, "blower": false, "maxTemp": 30 }
      }
    }
    ```

### `POST /iot/automation`
> Setel Automation (ON/OFF).

* **Body:** `{ "status": true }`
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Automation status updated successfully.",
      "data": { "automation": true }
    }
    ```

### `POST /iot/blower`
> Setel Manual Blower (ON/OFF).

* **Body:** `{ "status": false }`
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Blower status updated successfully.",
      "data": { "blower": false }
    }
    ```

### `POST /iot/maxtemp`
> Setel batas suhu maksimal.

* **Access:** Admin only
* **Body:** `{ "temp": 32 }`
* **Response:**
    ```json
    {
      "status": "success",
      "message": "Max temp updated successfully.",
      "data": { "maxTemp": 32 }
    }
    ```

---

## 📊 Logs & Audit

### `GET /logs/sensor-logs`
> History sensor (Default: 7 hari terakhir).

* **Response:**
    ```json
    {
      "status": "success",
      "data": [
        { "temp": 29, "humidity": 68, "timestamp": "2025-11-03T10:00:00.000Z" },
        { "temp": 28.5, "humidity": 70, "timestamp": "2025-11-03T09:55:00.000Z" }
      ]
    }
    ```

### `GET /logs/audit-logs`
> History perubahan setting IoT.

* **Response:**
    ```json
    {
      "status": "success",
      "data": [
        {
          "action": "set_max_temp",
          "newValue": 32,
          "user": { "email": "admin@example.com", "role": "superAdmin" }
        }
      ]
    }
    ```

### `GET /logs/system-logs`
> Log aktivitas sistem (misal: Delete user).

* **Access:** Admin only
* **Response:**
    ```json
    {
      "status": "success",
      "message": "System log data retrieved successfully.",
      "data": [
        {
          "action": "SOFT_DELETE_USER",
          "targetUid": "ZCJFHh1Up...",
          "actorUid": "lY2hvov3...",
          "payload": {
              "email": "farmer@greenhouse.com",
              "role": "farmer"
          },
          "timestamp": "2025-12-02T14:15:09.031Z",
          "actor": {
              "name": "admin",
              "email": "admin@greenhouse.com"
          }
        }
      ]
    }
    ```

---

## 🛑 Error Codes

| Code | Meaning |
| :--- | :--- |
| **400** | Bad Request (Input salah/kurang) |
| **401** | Unauthorized (Token expired/invalid) |
| **403** | Forbidden (Role tidak cukup) |
| **404** | Not Found |
| **500** | Server Error |