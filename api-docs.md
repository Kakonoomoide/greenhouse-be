# 🚀 API Documentation (Smart Farm IoT)

## 📌 General Info

### Base URL

Semua _endpoint_ diawali dengan _base URL_ ini.

- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.yourdomain.com/api`

### 🔑 Authentication (PENTING)

Hampir semua _endpoint_ (kecuali `/login`) butuh _Header_ Otorisasi. _Token_-nya didapet dari _response_ `/login`.

- **Header:** `Authorization`
- **Value:** `Bearer <idToken_dari_firebase>`

---

## 🔐 Auth Endpoints

### `POST /login`

Login buat dapetin _token_.

- **Requires:** Public (Nggak perlu _token_)
- **Body (JSON):**
  ```json
  {
    "email": "admin@example.com",
    "password": "yourpassword123"
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Login successful.",
    "data": {
      "idToken": "eyJhbGciOiJSUz...",
      "refreshToken": "AEu4IL...",
      "uid": "rQdEDrYa9LPnApJFOexUPYM55Kl1"
    }
  }
  ```

### `POST /register`

Nambahin _user_ baru (admin atau _super admin_).

- **Requires:** Auth (**Super Admin** only)
- **Body (JSON):**
  ```json
  {
    "email": "newadmin@example.com",
    "password": "newpassword123",
    "name": "Nama Admin Baru",
    "username": "admin_baru",
    "role": "admin", // "admin" atau "superAdmin"
    "noTelp": "08123456789" // opsional
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Registration successful.",
    "data": {
      "uid": "xYzAaBbCc..."
    }
  }
  ```

---

## 👤 User Endpoints

### `GET /profile`

Ngambil data _profile_ _user_ yang lagi login.

- **Requires:** Auth (Any user)
- **Body:** (Nggak perlu)
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Profile retrieved successfully.",
    "data": {
      "uid": "rQdEDrYa9LPnApJFOexUPYM55Kl1",
      "email": "admin@example.com",
      "name": "Nama Admin",
      "username": "admin_keren",
      "phone": "08123456789",
      "role": "superAdmin",
      "createdAt": "2025-11-03T08:18:44.414Z"
    }
  }
  ```

### `PUT /profile`

Update data _profile_ _user_ yang lagi login.

- **Requires:** Auth (Any user)
- **Body (JSON):** (Kirim yang mau di-update aja)
  ```json
  {
    "name": "Nama Baru Keren",
    "username": "admin_baru_keren",
    "noTelp": "08987654321"
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully.",
    "data": {
      "name": "Nama Baru Keren",
      "username": "admin_baru_keren",
      "phone": "08987654321"
    }
  }
  ```

### `POST /profile/change-password`

Ganti _password_ _user_ yang lagi login.

- **Requires:** Auth (Any user)
- **Body (JSON):**
  ```json
  {
    "newPassword": "passwordbarusaya"
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Password changed successfully.",
    "data": null
  }
  ```

### `GET /admin/users`

_Endpoint dummy_ buat ngetes _role_ Super Admin.

- **Requires:** Auth (**Super Admin** only)
- **Body:** (Nggak perlu)
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Admin data retrieved successfully.",
    "data": {
      "message": "Welcome, Super Admin. This is all user data.",
      "currentUser": {
        "uid": "rQdEDrYa9LPnApJFOexUPYM55Kl1",
        "role": "superAdmin"
        // ... (data token lainnya)
      }
    }
  }
  ```

---

## ⚡ IoT Endpoints

(Base URL: `/iot`)

### `GET /iot/status`

Ngambil semua data IoT dari RTDB _path_ `/iot1`.

- **Requires:** Auth (Any user)
- **Body:** (Nggak perlu)
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "IoT data retrieved successfully.",
    "data": {
      "sensor": {
        "temp": 28.5,
        "humidity": 70
      },
      "config": {
        "automation": true,
        "blower": false,
        "maxTemp": 30
      }
    }
  }
  ```

### `GET /iot/config`

Ngambil data _config_ aja dari RTDB _path_ `/iot1/config`.

- **Requires:** Auth (Any user)
- **Body:** (Nggak perlu)
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "IoT config retrieved successfully.",
    "data": {
      "automation": true,
      "blower": false,
      "maxTemp": 30
    }
  }
  ```

### `POST /iot/automation`

Nyetel status _automation_ (On/Off).

- **Requires:** Auth (Any user)
- **Body (JSON):**
  ```json
  {
    "status": true
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Automation status updated successfully.",
    "data": {
      "automation": true
    }
  }
  ```

### `POST /iot/blower`

Nyetel status _blower_ (On/Off).

- **Requires:** Auth (Any user)
- **Body (JSON):**
  ```json
  {
    "status": false
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Blower status updated successfully.",
    "data": {
      "blower": false
    }
  }
  ```

### `POST /iot/maxtemp`

Nyetel batas _max temp_ (angka).

- **Requires:** Auth (**Super Admin** only)
- **Body (JSON):**
  ```json
  {
    "temp": 32
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Max temp updated successfully.",
    "data": {
      "maxTemp": 32
    }
  }
  ```

---

## 📊 Logs Endpoints

(Base URL: `/logs`)

### `GET /logs/sensor-logs`

Ngambil _history_ log sensor dari Firestore (7 hari terakhir).

- **Requires:** Auth (Any user)
- **Body:** (Nggak perlu)
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Sensor data for the last 7 days retrieved successfully.",
    "data": [
      {
        "temp": 29,
        "humidity": 68,
        "timestamp": "2025-11-03T10:00:00.000Z"
      },
      {
        "temp": 28.5,
        "humidity": 70,
        "timestamp": "2025-11-03T09:55:00.000Z"
      }
    ]
  }
  ```

### `GET /logs/audit-logs`

Ngambil _history_ perubahan _setting_ (Audit) dari Firestore (10 _logs_ terakhir).

- **Requires:** Auth (Any user)
- **Body:** (Nggak perlu)
- **Success Response (Example):**
  ```json
  {
    "status": "success",
    "message": "Audit log data retrieved successfully.",
    "data": [
      {
        "action": "set_max_temp",
        "newValue": 32,
        "userId": "rQdEDrYa9LPnApJFOexUPYM55Kl1",
        "timestamp": "2025-11-03T10:12:00.000Z",
        "user": {
          "email": "admin@example.com",
          "name": "Nama Admin",
          "phone": "08123456789",
          "role": "superAdmin",
          "username": "admin_keren"
        }
      }
    ]
  }
  ```
