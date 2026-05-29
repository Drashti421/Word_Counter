import { Router } from "express";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { UserModel } from "../models/User.js";
import { canSendResetEmail, sendResetEmail } from "../services/email.js";

const router = Router();

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");
const resetUrlBase = process.env.RESET_URL_BASE || "http://localhost:5173/login";

router.get("/me", async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await UserModel.findById(req.session.userId).lean();
  if (!user) {
    req.session.userId = undefined;
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.json({
    id: String(user._id),
    email: user.email,
    displayName: user.displayName || user.email.split("@")[0],
  });
});

router.post("/signup", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const displayName =
      typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (displayName.length > 40) {
      return res.status(400).json({ message: "Name is too long" });
    }

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      email,
      passwordHash,
      displayName,
    });

    req.session.userId = String(user._id);
    return res.status(201).json({
      id: String(user._id),
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.userId = String(user._id);
    return res.json({
      id: String(user._id),
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
    });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(204).send();
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.clearCookie("session_id");
    return res.status(204).send();
  });
});

router.post("/forgot", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      const resetToken = randomBytes(24).toString("hex");
      user.resetTokenHash = hashResetToken(resetToken);
      user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 15);
      await user.save();
      const separator = resetUrlBase.includes("?") ? "&" : "?";
      const resetLink = `${resetUrlBase}${separator}resetToken=${encodeURIComponent(resetToken)}`;

      if (process.env.NODE_ENV === "production") {
        try {
          if (canSendResetEmail()) {
            await sendResetEmail({ to: user.email, resetLink });
          } else {
            console.warn("Reset email provider not configured. Skipping email send in production.");
          }
        } catch (error) {
          console.error("Failed to send reset email", error);
        }
      }

      if (process.env.NODE_ENV !== "production") {
        return res.status(200).json({
          message: "Reset token generated for development.",
          resetToken,
          resetLink,
          expiresInMinutes: 15,
        });
      }
    }

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: "Failed to start password reset" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const tokenHash = hashResetToken(token);
    const user = await UserModel.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetTokenHash = "";
    user.resetTokenExpiresAt = null;
    await user.save();

    if (req.session) {
      req.session.userId = undefined;
    }

    return res.status(200).json({ message: "Password reset successful. Please log in." });
  } catch {
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router;
