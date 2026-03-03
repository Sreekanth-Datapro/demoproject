const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const csurf = require("csurf");
require("dotenv").config();
require("./db");

const app = express();

app.set("trust proxy", 1);

// ================= SECURITY HEADERS =================
app.use(helmet());

// ================= CORS =================
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ================= RATE LIMIT =================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts"
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ================= CSRF SETUP =================
// IMPORTANT: For localhost use Lax + secure false
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "Lax",  // Strict may fail on localhost
    secure: false     // must be false on localhost (no HTTPS)
  }
});

// Apply CSRF to ALL auth routes
app.use("/api/auth", csrfProtection);

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  console.error(err);
  res.status(500).json({ message: "Server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});