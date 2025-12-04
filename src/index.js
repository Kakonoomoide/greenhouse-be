// api/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import allRoutes from "../routes/index.js";
import healthRoutes from "../routes/healthRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Pasang semua routes
app.use("/api", allRoutes);
app.use("/", healthRoutes);

// Error handling middleware
app.use((err, res) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan di server",
    data: null,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
