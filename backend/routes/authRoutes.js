const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken"); // ✅ path fixed
const csurf = require("csurf");

// CSRF protection
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  }
});

// CSRF token endpoint
router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Public routes
router.post("/register", csrfProtection, authController.register);
router.post("/login", csrfProtection, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Protected route
router.get("/profile", verifyToken, authController.profile);

module.exports = router;