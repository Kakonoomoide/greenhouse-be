// api/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import allRoutes from "../routes/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Pasang semua routes
app.use("/api", allRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan di server",
    data: null,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
