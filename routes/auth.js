const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (!["elector", "contestant"].includes(role)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    //   return res.redirect("/login?msg=Email already registered!!")
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "Registered successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
//   const message = req.query.msg;
//   response.send(message);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Save user info in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({ message: "Login successful!", role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

// GET /auth/me — returns current logged-in user info
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in." });
  }
  res.json(req.session.user);
});

module.exports = router;