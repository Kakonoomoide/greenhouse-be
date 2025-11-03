# 🚀 Smart Farm IoT - Backend API

Ini adalah _backend server_ untuk proyek Smart Farm IoT, yang dibuat menggunakan Node.js, Express, dan Firebase. API ini menangani otentikasi pengguna, manajemen data IoT _real-time_, dan _logging_.

---

## ✨ Fitur Utama

- **Otentikasi Pengguna:** Register dan Login menggunakan Firebase Auth.
- **Manajemen Role:** Perbedaan hak akses antara `admin` dan `superAdmin`.
- **Kontrol IoT Real-time:** Membaca dan menulis data (status sensor, config) ke Firebase Realtime Database.
- **Manajemen User:** Get/Update profile dan ganti password.
- **Logging:**
  - **Audit Logs:** Mencatat semua perubahan _setting_ penting ke Firestore.
  - **Sensor Logs:** (Asumsi) Menyimpan data sensor historis ke Firestore.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Firebase (Authentication, Realtime Database, Firestore)
- **Module Type:** ES Modules (ESM)
- **Lain-lain:** `dotenv` (Environment Variables), `cors`, `swagger-ui-express`

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda memiliki:

- [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
- Akun [Firebase](https://firebase.google.com/)
- `nodemon` (terinstall global) untuk development: `npm install -g nodemon`

---

## ⚙️ Instalasi & Setup

1.  **Clone repository:**

    ```sh
    git clone <URL_REPOSITORY_ANDA>
    cd <NAMA_FOLDER_PROJECT>
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Setup Firebase:**

    - Buat proyek baru di [Firebase Console](https://console.firebase.google.com/).
    - Aktifkan **Authentication** (Email/Password).
    - Buat **Realtime Database**.
    - Buat **Firestore Database**.
    - Pergi ke _Project Settings_ > _Service accounts_.
    - Klik _Generate new private key_ dan _download_ file `.json` _service account_.
    - **PENTING:** Ganti nama _file_ ini menjadi `firebaseAdmin.js` dan letakkan di _root_ proyek (atau di _folder_ `lib/` sesuai _code_ Anda).

4.  **Setup Environment Variables:**

    - Buat _file_ baru di _root_ bernama `.env`
    - Salin isi dari `.env.example` (atau isi manual):

    ```ini
    # Port untuk server
    PORT=3000

    # Kredensial Firebase (dari web config, BUKAN admin sdk)
    # Ini dibutuhkan untuk API key register/login
    FIREBASE_API_KEY="AIzaSy..."

    ```

---

## 🚀 Menjalankan Server

Untuk menjalankan server dalam _development mode_ (dengan _hot-reload_):

```sh
npm run dev
```
