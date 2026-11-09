const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Enter a name, valid email, and password of at least 6 characters" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name: name.trim(), email: normalizedEmail, password: hashed });
    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Email already registered" });
    console.error(error);
    return res.status(500).json({ message: "Registration failed" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "Email and password required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
});
module.exports = router;
