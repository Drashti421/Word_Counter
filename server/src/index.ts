import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import historyRouter from "./routes/history.js";
import authRouter from "./routes/auth.js";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174";
const sessionSecret = process.env.SESSION_SECRET || "";
const mongoRetryMs = Number(process.env.MONGO_RETRY_MS || 5000);
let isDbConnected = false;
const allowedOrigins = corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isAllowedDevLocalOrigin = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (server-to-server, curl, health checks).
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin) || isAllowedDevLocalOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.set("trust proxy", 1);

app.get("/health", (_req, res) => {
  res.json({ ok: true, dbConnected: isDbConnected });
});

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing. Add it in server/.env");
}
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is missing. Add it in server/.env");
}

const connectMongoWithRetry = async () => {
  try {
    await mongoose.connect(mongoUri);
    isDbConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    isDbConnected = false;
    console.error(`MongoDB connection failed. Retrying in ${mongoRetryMs}ms...`, error);
    setTimeout(() => {
      void connectMongoWithRetry();
    }, mongoRetryMs);
  }
};

mongoose.connection.on("connected", () => {
  isDbConnected = true;
});

mongoose.connection.on("disconnected", () => {
  isDbConnected = false;
  console.warn(`MongoDB disconnected. Retrying in ${mongoRetryMs}ms...`);
  setTimeout(() => {
    void connectMongoWithRetry();
  }, mongoRetryMs);
});

app.use(
  session({
    name: "session_id",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions",
      mongoOptions: {
        serverSelectionTimeoutMS: 5000,
      },
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/history", historyRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

void connectMongoWithRetry();
