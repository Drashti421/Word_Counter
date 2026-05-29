import { Router } from "express";
import { HistoryItemModel } from "../models/HistoryItem.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await HistoryItemModel.find({ ownerId: req.session!.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const payload = items.map((item) => ({
      id: String(item._id),
      text: item.text,
      wordCount: item.wordCount,
      timestamp: item.createdAt,
    }));
    res.json(payload);
  } catch {
    res.status(500).json({ message: "Failed to load history" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const wordCount = typeof req.body?.wordCount === "number" ? req.body.wordCount : 0;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const item = await HistoryItemModel.create({
      ownerId: req.session!.userId,
      text,
      wordCount,
    });

    return res.status(201).json({
      id: String(item._id),
      text: item.text,
      wordCount: item.wordCount,
      timestamp: item.createdAt,
    });
  } catch {
    return res.status(500).json({ message: "Failed to save history item" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryItemModel.findOneAndDelete({ _id: id, ownerId: req.session!.userId });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Failed to delete history item" });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    await HistoryItemModel.deleteMany({ ownerId: req.session!.userId });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Failed to clear history" });
  }
});

export default router;
