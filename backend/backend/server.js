import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { Server as SocketIOServer } from "socket.io";
import fs from "fs"; 
import path from "path";

import { connectDB } from "./src/config/db.js";
import { errorHandler, notFound } from "./src/middleware/errorHandler.js";
import { initSocket } from "./src/socket/index.js";

import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import matchRoutes from "./src/routes/matchRoutes.js";
import interestRoutes from "./src/routes/interestRoutes.js";
import kundaliRoutes from "./src/routes/kundaliRoutes.js";
import priestRoutes from "./src/routes/priestRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import testimonialRoutes from "./src/routes/testimonialRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import { handleWebhook } from "./src/controllers/paymentController.js";

console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");
console.log("PORT:", process.env.PORT);

await connectDB();

const app = express();
const server = http.createServer(app);

// Enable proxy trust for accurate IP rate limiting
app.set("trust proxy", 1);

// Initialize Socket.IO Early so we can attach it to the app instance safely
const allowedOrigins = [
  "http://localhost:5173",
  "https://deevbhoomi-bandhan-frontend-1.onrender.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());
initSocket(io);
app.set("io", io); // Now safely available to all route controllers below!

// ─── 1. HELMET SECURITY SETUP ───────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://avatar.iran.liara.run", "*"],
      },
    },
  })
);

// ─── SINGLE, UNIFIED CORS MIDDLEWARE ─────────────────────────────────────
// (Previously there were two conflicting cors() calls here — one dynamic,
// one hardcoded with a placeholder frontend URL. That caused the browser
// to reject every cross-origin request, including sign-in. Removed the
// duplicate; this is now the only CORS setup in the app.)
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin.trim())) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

// ─── 2. STATIC FILE RESOLUTION ───────────────────────────────────────────
const uploadsPath = path.join(process.cwd(), "uploads");
console.log(`📂 Serving static file resources from: ${uploadsPath}`);

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Single clean unified handler for served files
app.use(
  "/uploads",
  express.static(uploadsPath, {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);
app.use("/src/uploads", express.static(uploadsPath));

// ─── 3. REQUEST PARSERS & WEBHOOKS ────────────────────────────────────────
// CRITICAL: Webhook is defined BEFORE standard JSON parsers and BEFORE global rate limiters
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── 4. RATE LIMITERS ───────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

// Apply rate limiting selectively to safeguard your webhooks
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter); 

// ─── 5. APPLICATION API ROUTES ───────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    message: "देवभूमि बंधन API is running",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/kundali", kundaliRoutes);
app.use("/api/priest", priestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);

// ─── 6. FALLBACK ERROR HANDLERS ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
