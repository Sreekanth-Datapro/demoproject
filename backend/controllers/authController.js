const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "user"]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(400).json({ message: "User already exists" });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      await db.execute(
        "INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
        [user.id, "LOGIN_FAILED", req.ip]
      );

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await db.execute(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [user.id, tokenHash]
    );

    // 🔥 Log success
    await db.execute(
      "INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
      [user.id, "LOGIN_SUCCESS", req.ip]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= REFRESH =================
exports.refresh = async (req, res) => {
  try {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken)
      return res.status(403).json({ message: "No refresh token" });

    const oldTokenHash = crypto
      .createHash("sha256")
      .update(oldToken)
      .digest("hex");

    const [rows] = await db.execute(
      "SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()",
      [oldTokenHash]
    );

    if (!rows.length)
      return res.status(403).json({ message: "Invalid or expired refresh token" });

    const decoded = jwt.verify(oldToken, process.env.REFRESH_SECRET);

    await db.execute(
      "DELETE FROM refresh_tokens WHERE token_hash = ?",
      [oldTokenHash]
    );

    const newAccessToken = generateAccessToken(decoded);
    const newRefreshToken = generateRefreshToken(decoded);

    const newTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await db.execute(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [decoded.id, newTokenHash]
    );

    // 🔥 Log refresh
    await db.execute(
      "INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
      [decoded.id, "TOKEN_REFRESH", req.ip]
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    console.error("REFRESH ERROR:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};


// ================= LOGOUT =================
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

      await db.execute(
        "DELETE FROM refresh_tokens WHERE token_hash = ?",
        [tokenHash]
      );

      // 🔥 Log logout
      await db.execute(
        "INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
        [decoded.id, "LOGOUT", req.ip]
      );
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= PROFILE =================
exports.profile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);

  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};