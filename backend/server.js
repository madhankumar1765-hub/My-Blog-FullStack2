require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) return res.status(400).json({ message: "Invalid JSON" });
  console.error(err);
  res.status(500).json({ message: "Server error" });
});
async function start() {
  if (!process.env.MONGO_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Set MONGO_URL and a JWT_SECRET of at least 32 characters in .env");
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB connected successfully");
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}
start().catch(err => { console.error("Startup failed:", err.message); process.exit(1); });
