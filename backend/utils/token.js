const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ================= ACCESS TOKEN =================
const generateAccessToken = (user) => {
  if (!user || !user.id) {
    throw new Error("User ID missing when generating access token");
  }

  return jwt.sign(
    {
      id: user.id,   // ✅ MYSQL uses id
      role: user.role
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: "15m"
    }
  );
};

// ================= REFRESH TOKEN =================
const generateRefreshToken = (user) => {
  if (!user || !user.id) {
    throw new Error("User ID missing when generating refresh token");
  }

  return jwt.sign(
    {
      id: user.id,
      jti: crypto.randomUUID()
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};